import Questioner from './questioner';
import {Fetcher} from './fetcher';
import {JUST, NEXT, PREV} from '../constants';
import write from './writer/index';

export default class SiteController {
    private _stage  = 0;
    private _params = [];
    private _fetcher: Fetcher;

    constructor(private _site: Site) {
        this._fetcher = new Fetcher(_site.url);
    }

    async stage(param = {} as StageParam) {
        this.setStageParam(param);
        const {type, selector, attrs, operation, message, options} = this.getStageInfo();
        const {url = ''} = param;
        const dom        = await this._fetcher.dom(url);
        const elements   = Array.from(dom.querySelectorAll(selector));
        const choices    = elements.map(element => {
            const name  = attrs.name ? element.getAttribute(attrs.name) : element.textContent;
            const url = element.getAttribute(attrs.value);

            return {
                name: `${name} [${url}]`,
                value: {name, url}
            };
        });
        const handler    = {
            list:     async () => await this.select(type, message, choices, operation),
            download: () => {
                const {answer: {name}} = this.getStageParam();
                this.download(name, choices.map(choice => choice.value.url), options);
            }
        }[type];
        const result     = await handler();

        if (operation.type === PREV) {
            await this.prev();
        }

        return result;
    }

    private async select(type, message, choices, operation) {
        const {select}        = await Questioner.askSelection({
            type, message, choices,
            name:      'select',
            paginated: true,
            pageSize:  20
        });
        const {name, url} = select;

        if (name === '..') {
            await this.prev();
        } else if (operation.type === NEXT) {
            await this.next({url: url, answer: select});
        }

        return select;
    }

    private setStageParam(param: StageParam) {
        this._params[this._stage] = param;
    }

    private getStageParam(): StageParam {
        return this._params[this._stage];
    }

    private getStageInfo(): Stage<Operation> {
        return this._site.stages[this._stage];
    }

    private async download(filename, urls, options: DownloadOptions = [JUST]) {
        const responses = await Fetcher.images(urls);
        write(filename, responses.filter(Boolean), options);
    }

    private async next(stageParam: StageParam) {
        this.setStep(this._stage + 1);
        return this.stage(stageParam);
    }

    async prev(stageParam?) {
        if (this._stage === 0) {
            return;
        }
        this.setStep(this._stage - 1);
        if (!stageParam) {
            stageParam = this.getStageParam();
        }
        return this.stage(stageParam);
    }

    private async loop(stageParam: StageParam) {
        return this.stage(stageParam);
    }

    private setStep(step): void {
        this._stage = step;
    }
}
