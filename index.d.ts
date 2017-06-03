type OperationType = 'next' | 'prev';
type Sites = Site[];
type StepType = 'list' | 'download';
type DownloadOption = 'just'|('split'|'splitRight')|'zip';
type DownloadOptions = DownloadOption[];
type Stage = BaseStage|SelectableStage|DownloadableStage;
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
interface SelectableStage extends BaseStage,Selectable {}
interface DownloadableStage extends BaseStage,Selectable,DownLoadable {}
interface ChoiceOptionValue {
    name: string;
    url: string;
}
interface StageParam {
    name: string;
    url: string;
    blockTypes?: StepType[];
    prevAfterStage?: boolean;
}
interface ChoiceOption {
    name: string;
    value: ChoiceOptionValue;
}
interface MapString {
    [key: string]: string;
}
