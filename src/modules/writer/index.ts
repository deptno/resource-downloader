import * as fs from 'fs';
import {FileWriter, ZipWriter, WriteEventCallback} from './writer';
import * as path from 'path';
import {SPLIT, SPLIT_RIGHT, ZIP} from '../../constants';
import {splitIfWidthBiggerThenHeight} from '../image-processor/index';

export default async (name, streams, options: DownloadOptions): Promise<any> => {
    const optZip   = options.find(option => option === ZIP);
    const optSplit = options.find(option => option === SPLIT || option === SPLIT_RIGHT);
    const writer   = optZip
        ? new ZipWriter(fs.createWriteStream(zipName(name)))
        : new FileWriter();
    const append = writer.append.bind(writer);
    const finalize = writer.finalize.bind(writer);

    return doWrite(streams, optSplit, append).then(finalize)
};

const zipName = (name: string) => `${name.replace(/\s/g, '_')}.zip`;
const doWrite = async (streams, splitOption: DownloadOption, onWrite: WriteEventCallback): Promise<void[]> => {
    const repeater: (ext, stream) => Promise<NodeJS.ReadableStream[]> = splitOption
        ? (ext, stream) => splitIfWidthBiggerThenHeight(ext, stream, splitOption === SPLIT_RIGHT)
        : async (ext, data) => [data];

    return Promise.all<void>(
        streams.map(async (response, name) => {
            const ext = path.extname(response.config.url);
            const data = response.data;

            if (ext === '.bmp') {
                onWrite(`${name}0${ext}`, data);
                return;
            }

            const result = await repeater(ext, data);
            result.forEach((data, postfix) => onWrite(`${name}${postfix}${ext}`, data));
        })
    );
};
