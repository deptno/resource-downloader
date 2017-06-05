import * as chalk from 'chalk';
import {PassThrough} from 'stream';
import {NAME, VERSION} from '../constants';

export enum Status {
    PENDING,
    OK,
    ERROR,
}
interface Log {
    name: string;
    promise: Promise<Log|any>;
    status: Status;
    timestamp: Date;
    bytes?: number;
}

class Logger {
    private _logs: Log[] = [];
    private _logger = new PassThrough();
    private _lazyLogger = new PassThrough();

    constructor() {
        console.log(`${chalk.yellow(NAME)} v${VERSION}`);
    }

    add(name: string, promise: Promise<any>) {
        const log: Log = {
            name,
            promise: promise
                .then(bytes => {
                    log.status = Status.OK;
                    log.bytes = bytes;
                    return log;
                })
                .catch(_ => {
                    log.status = Status.ERROR;
                    return log;
                })
                .then(log => this._lazyLogger.write(this.template(log)))
            ,
            status : Status.PENDING,
            timestamp: new Date()
        };
        this._logs.push(log);
    }

    flush(): PassThrough {
        this.flush = function dummyPipe() {
            this.pipe = () => {};
            return this;
        };
        console.log(chalk.yellow(`\nprepare to exit, remains works log will print.\n`));

        this._logs
            .filter(log => log.status === Status.PENDING)
            .forEach(log => this._logger.write(this.template(log)));

        this._lazyLogger.pipe(this._logger);
        return this._logger;
    }

    logs() {
        return this._logs;
    }

    status(log): string {
        const {status, bytes} = log;
        return `[${Status[status]}] ${bytes ? `[${bytes}]` : ''} `;
    }

    private template(log): string {
        const {status, name, bytes} = log;
        const remains = this._logs.filter(({status}) => status === Status.PENDING).length;
        const remainText = remains > 0
                ? `remains: ${remains}`
                : 'no remains';

        return `[${remainText}][${Status[status]}] ${bytes ? `[${bytes}]` : ''}${name}\n`;
    }
}

export const logger = new Logger();