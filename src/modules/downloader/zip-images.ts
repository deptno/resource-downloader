import * as archiver from 'archiver';

export class Zip {
    _zip: archiver.Archiver;

    constructor(writableStream) {
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