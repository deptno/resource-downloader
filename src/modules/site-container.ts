import Questioner from './questioner';
import {Fetcher} from './fetcher';
import {NEXT, PARENT_DIRECTORY, PREV, SPLIT, ZIP} from '../constants';
import write from './writer/index';

export default class SiteController {
    static mapElementToChoice(attrs: MapString, element: Element): ChoiceOption {
        const name = attrs.name
            ? element.getAttribute(attrs.name)
            : element.textContent;
        const url  = element.getAttribute(attrs.value);

        return {
            name:  `${name} [${url}]`,
            value: {name, url}
        };
    }

    private _stage                = 0;
    private _params: StageParam[] = [];
    private _fetcher: Fetcher;

    constructor(private _site: Site) {
        this._fetcher = new Fetcher(_site.url);
    }

    async stage(param = {} as StageParam) {
        this.setStageParam(param);

        await this.typeOperator();
        
        const {operation} = <DownloadableStage>this.getStageInfo();

        if (operation.type === PREV) {
            await this.prev(param.prevAfterStage);
        }
    }

    private async getChoicesByUrl() {
        const {url} = this.getStageParam();
        const {selector, attrs} = <SelectableStage>this.getStageInfo();
        const dom      = await this._fetcher.dom(url);
        const elements = Array.from(dom.querySelectorAll(selector));

        return elements.map<ChoiceOption>(
            SiteController.mapElementToChoice.bind(null, attrs)
        );
    }

    private async typeOperator() {
        const {blockTypes = []} = this.getStageParam();
        const {type, operation, message, options} = <DownloadableStage>this.getStageInfo();
        const choices = await this.getChoicesByUrl();

        if (!this.checkBlockType(blockTypes, type) && type === 'list') {
            await this.select(type, message, choices, operation);
        } else if (!this.checkBlockType(blockTypes, type) && type === 'download') {
            this.download(choices.map(choice => choice.value.url), options)
        }
    }
    
    private checkBlockType(blockTypes, type): boolean {
        return !!blockTypes.find(blockType => blockType === type);
    }

    private async select(type, message, choices, operation) {
        //fixme: this._stage === 1 -> need option: multi download
        const answer    = await Questioner.askSelection({
            type, message, choices,
            paginated: true,
            pageSize:  20
        }, false, this._stage === 1);

        if (Array.isArray(answer)) {
            const asyncLoop = async answers => {
                const answer = answers.shift();
                if (!answer) {
                    return;
                }
                console.log(`[remains: ${answers.length}] [queued] ${answer.name} [${answer.url}]`);
                await this.next({
                    blockTypes: ['list'],
                    prevAfterStage: answers.length === 0,
                    ...answer
                });
                await asyncLoop(answers);
            };
            await asyncLoop(answer);
        } else {
            const {name, url} = answer;

            if (name === PARENT_DIRECTORY) {
                await this.prev();
            } else if (operation.type === NEXT) {
                await this.next({url, name});
            }
        }
    }

    private setStageParam(param: StageParam) {
        this._params[this._stage] = param;
    }

    private getStageParam(): StageParam {
        return this._params[this._stage];
    }

    private getStageInfo(): Stage {
        return this._site.stages[this._stage];
    }

    private download(urls, options: DownloadOptions = [ZIP, SPLIT]): void {
        const {name} = this.getStageParam();
        Fetcher
            .images(urls)
            .then(responses => responses.filter(Boolean))
            .then(responses => write(name, responses, options));
    }

    private async next(stageParam: StageParam) {
        this.setStep(this._stage + 1);
        return this.stage(stageParam);
    }

    private async prev(prevAfterStage = true) {
        if (this._stage === 0) {
            return;
        }
        this.setStep(this._stage - 1);

        if (prevAfterStage) {
            const stageParam = this.getStageParam();
            return this.stage(stageParam);
        }
    }

    private async loop(stageParam: StageParam) {
        return this.stage(stageParam);
    }

    private setStep(step): void {
        this._stage = step;
    }
}
