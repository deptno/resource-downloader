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

const zipName: (url: string) => string = name => `${name.replace(/\s/g, '_')}.zip`;
const getName: (url: string) => string = url => path.basename(decodeURI(url));
const doWrite = async (streams, splitOption: DownloadOption, onWrite: WriteEventCallback): Promise<NameStream[]> => {
    const repeater: (name, stream) => Promise<NameStream[]> = splitOption
        ? splitIfWidthBiggerThenHeight
        : async (name, data) => [{name, data}];

    return Promise.all<NameStream>(
        streams.map(async response => {
            const name = getName(response.config.url);
            const data = response.data;

            const result = await repeater(name, data);
            result.forEach(({name, data}) => onWrite(name, data));
            return result;
        })
    );
};
