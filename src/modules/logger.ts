import * as chalk from 'chalk';
import {PassThrough} from 'stream';
import {NAME, VERSION} from '../constants';

enum Status {
    PENDING,
    OK,
    ERROR,
}
interface Log {
    name: string;
    promise: Promise<Log|any>;
    status: Status;
    timestamp: Date;
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
                .then(_ => {
                    log.status = Status.OK;
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
        console.log(chalk.yellow(`\nprepare to exit, remains works log will print.\n`));

        this._logs
            .filter(log => log.status === Status.PENDING)
            .map(this.template)
            .forEach(log => this._logger.write(log));

        this._lazyLogger.pipe(this._logger);
        return this._logger;
    }

    private template({status, name}): string {
        const remains = this._logs.filter(({status}) => status === Status.PENDING).length;

        if (remains === 0) {
            setTimeout(() => console.log(`you can exit now.`), 1);
        }

        return `[remains: ${remains}][${Status[status]}] ${name}\n`;
    }
}

export const logger = new Logger();