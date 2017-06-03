import * as archiver from 'archiver';
import * as fs from 'fs';
import {ReadStream} from 'fs';
import * as bytes from 'bytes';

export type WriteEventCallback = (name: string, stream: ReadStream) => void;

export interface Writer {
    append: WriteEventCallback;
    finalize();
}

abstract class AbsWriter implements Writer {
    abstract append(name: string, stream: ReadStream);

    abstract finalize(): Promise<string>;
}

export class ZipWriter extends AbsWriter {
    private _zip: archiver.Archiver;
    private _event;

    constructor(writableStream) {
        super();
        this._zip   = archiver('zip');
        this._event = new Promise((resolve, reject) => {
            this._zip.on('error', reject);
            this._zip.on('end', () => resolve(bytes(this.pointer())));
        });
        this._zip.pipe(writableStream);
    }

    append(name, stream) {
        this._zip.append(stream, {name});
    }

    finalize(): Promise<string> {
        this._zip.finalize();
        return this._event;
    }

    pointer(): number {
        return this._zip.pointer();
    }
}

export class FileWriter extends AbsWriter {
    append(name: string, stream: ReadStream) {
        stream.pipe(fs.createWriteStream(name));
    }

    finalize() {
        return Promise.resolve('UNSUPPORTED');
    }
}