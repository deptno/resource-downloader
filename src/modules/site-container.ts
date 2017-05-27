import * as path from 'path';
import * as fs from 'fs';
import * as bytes from 'bytes';
import Questioner from './questioner';
import {Zip} from './downloader/zip-images';
import {Fetcher} from './fetcher';
import {Operations} from '../constants';

export default class SiteController {
    private _stage  = 0;
    private _params = [];
    private _fetcher: Fetcher;

    constructor(private _site: Site) {
        this._fetcher = new Fetcher(_site.url);
    }

    async stage(param = {} as StageParam) {
        this.setStageParam(param);
        const {url = ''}                                  = param;
        const stageInfo                                   = this.getStageInfo();
        const {type, selector, attrs, operation, message} = stageInfo;
        const dom                                         = await this._fetcher.dom(url);
        const elements                                    = Array.from(dom.querySelectorAll(selector));
        const choices                                     = elements.map(element => {
            const name  = attrs.name ? element.getAttribute(attrs.name) : element.textContent;
            const value = element.getAttribute(attrs.value);

            return {
                name,
                value: JSON.stringify({name, value})
            };
        });
        const handler                                     = {
            list:     async () => await this.select(type, message, choices, operation),
            download: () => {
                const {answer: {name}} = this.getStageParam();
                this.download(
                    `${name.replace(/\s/g, '_')}.zip`,
                    choices.map(choice => JSON.parse(choice.value).value)
                );
            }
        }[type];
        const result = await handler();

        if (operation.type === Operations.PREV) {
            await this.prev();
        }

        return result;
    }

    private async select(type, message, choices, operation) {
        const answer        = await Questioner.ask({
            type, message, choices,
            name:      'name',
            paginated: true,
            pageSize:  30
        });
        const {name, value} = answer;

        if (operation.type === Operations.NEXT) {
            await this.next({url: value, answer});
        }
        
        return value;
    }

    private setStageParam(param) {
        this._params[this._stage] = param;
    }

    private getStageParam(): StageParam {
        return this._params[this._stage];
    }

    private getStageInfo() {
        return this._site.stages[this._stage];
    }

    private download(filename, urls) {
        process.nextTick((async (filename, urls) => {
            const responses = await this._fetcher.images(urls);
            const output    = fs.createWriteStream(filename);
            const zip       = new Zip(output);

            console.log(`[DN] ${filename} ${urls.length} files`);
            output.on('close', () => console.log(`[DONE] ${bytes.format(zip.pointer(), {decimalPlaces: 0})} ${filename}`));
            responses
                .filter(Boolean)
                .map(response => {
                    const name   = path.basename(decodeURI(response.config.url));
                    const stream = response.data;
                    zip.append(name, stream);
                });
            zip.finalize();
        }).bind(this, filename, urls))
    }

    private async next(stageParam) {
        this.setStep(this._stage + 1);
        return this.stage(stageParam);
    }

    private async prev(stageParam?) {
        this.setStep(this._stage - 1);
        if (!stageParam) {
            stageParam = this.getStageParam();
        }
        return this.stage(stageParam);
    }

    private async loop(stageParam) {
        return this.stage(stageParam);
    }

    private setStep(step): void {
        this._stage = step;
    }
}
