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

        const {type, selector, attrs, operation, message, options}
                       = <DownloadableStage>this.getStageInfo();
        const dom      = await this._fetcher.dom(param.url);
        const elements = Array.from(dom.querySelectorAll(selector));
        const choices  = elements.map<ChoiceOption>(
            SiteController.mapElementToChoice.bind(null, attrs)
        );

        if (type === 'list') {
            await this.select(type, message, choices, operation);
        } else if (type === 'download') {
            this.download(choices.map(choice => choice.value.url), options)
        }

        if (operation.type === PREV) {
            await this.prev();
        }
    }

    private async select(type, message, choices, operation) {
        const {select}    = await Questioner.askSelection({
            type, message, choices,
            name:      'select',
            paginated: true,
            pageSize:  20
        });
        const {name, url} = select;

        if (name === PARENT_DIRECTORY) {
            await this.prev();
        } else if (operation.type === NEXT) {
            await this.next({url, name});
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

    private async prev(stageParam?) {
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
