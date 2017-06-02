type OperationType = 'next' | 'prev';
type Sites = Site[];
type StepType = 'list' | 'download';
type DownloadOption = 'just'|('split'|'splitRight')|'zip';
type DownloadOptions = DownloadOption[];
type Stage = BaseStage|SeletableStage|DownloadableStage;
type Stages = Stage[];

interface Config {
    sites: Sites;
    remoteConfigs: string[];
}
interface Site {
    name: string;
    url: string;
    stages: Stages;
}
interface Op {
    type: OperationType;
}
interface DownLoadable {
    options?: DownloadOptions;
    prefixes?: {
        doing: string;
        done: string;
    }
}
interface Selectable {
    selector: string;
    attrs: {
        name?: string;
        value: string;
    };
}
interface BaseStage {
    type: StepType;
    message: string;
    operation: Op;
}
interface SeletableStage extends BaseStage,Selectable {}
interface DownloadableStage extends BaseStage,Selectable,DownLoadable {}
interface ChoiceOptionValue {
    url: string;
    name: string;
}
interface StageParam {
    url: string;
    name: string;
}
interface ChoiceOption {
    name: string;
    value: ChoiceOptionValue;
}
interface MapString {
    [key: string]: string;
}
