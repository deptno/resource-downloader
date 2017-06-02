type OperationType = 'next' | 'prev';
type Sites = Site[];
type OpNext = Op<null>;
type OpDownload = Op<DownloadInfo>
type Operation = OpNext | OpDownload;
type StepType = 'list' | 'download';
type Stages = Stage<Operation>[];

interface Config {
    sites: Sites;
    remoteConfigs: string[];
}
interface Site {
    name: string;
    url: string;
    stages: Stages;
}
interface Selectable {
    selector: string;
    attrs: {
        name: string;
        value: string;
    };
}
interface Stage<Operation> extends Selectable {
    type: StepType;
    message: string;
    operation: Operation;
}
interface Op<T> {
    type: OperationType;
    data: T;
}
interface DownloadInfo extends Selectable {
    prefixes: {
        doing: string;
        done: string;
    }
}
interface StageParam {
    url: string;
    answer: {
        name: string;
        value: string;
    }
}