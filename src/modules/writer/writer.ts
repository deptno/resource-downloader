import * as archiver from 'archiver';
import * as fs from 'fs';
import {ReadStream} from 'fs';

export type WriteEventCallback = (name: string, stream: ReadStream) => void;
export interface Writer {
    append: WriteEventCallback;
    finalize();
}

abstract class AbsWriter implements Writer {
    abstract append(name: string, stream: ReadStream);

    abstract finalize();
}

export class ZipWriter extends AbsWriter {
    _zip: archiver.Archiver;

    constructor(writableStream) {
        super();
        this._zip = archiver('zip');
        this._zip.on('error', function (err) {
            console.error('zip error', err);
            throw err;
        });
        this._zip.pipe(writableStream);
    }

    append(name, stream) {
        this._zip.append(stream, {name});
    }

    finalize() {
        this._zip.finalize();
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

    }
}