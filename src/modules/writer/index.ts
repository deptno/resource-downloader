import * as fs from 'fs';
import {FileWriter, ZipWriter, WriteEventCallback} from './writer';
import * as sharp from 'sharp';
import * as path from 'path';
import {SPLIT, SPLIT_RIGHT, ZIP} from '../../constants';
import {logger} from '../logger';

export default (name, streams, options: DownloadOptions) => {
    const optZip   = options.find(option => option === ZIP);
    const optSplit = options.find(option => option === SPLIT || option === SPLIT_RIGHT);
    const writer   = optZip
        ? new ZipWriter(fs.createWriteStream(zipName(name)))
        : new FileWriter();
    const append = writer.append.bind(writer);
    const finalize = writer.finalize.bind(writer);

    logger.write(`[DOWNLOAD] ${name}\n`);
    doWrite(streams, optSplit, append)
        .then(finalize)
        .then(bytes => logger.write(`[OK] ${bytes} ${name}\n`))
        .catch(bytes => logger.write(`[ERROR] ${bytes} ${name}\n`));
};

const zipName = name => `${name.replace(/\s/g, '_')}.zip`;
const getName = url => path.basename(decodeURI(url));
const doWrite = async (streams, splitOption: DownloadOption, onWrite: WriteEventCallback) => {
    if (!splitOption) {
        return streams.map(response => onWrite(getName(response.config.url), response.data));
    }
    const [l, r] = splitOption === SPLIT ? [0, 1] : [1, 0];
    return Promise.all(streams.map(response => {
        const name     = getName(response.config.url);
        const stream   = response.data;
        const pipeline = sharp();

        stream.pipe(pipeline);
        return pipeline
            .metadata()
            .catch(ex => {
                logger.write(`[ISSUE] ${ex}, ${response.config.url}\n`);
                throw ex;
            })
            .then((name => ({width, height}) => {
                if (width > height) {
                    const half      = Math.floor(width / 2);
                    const leftPage  = pipeline.clone().extract({left: 0, top: 0, width: half, height});
                    const rightPage = pipeline.clone().extract({left: half, top: 0, width: half, height});

                    onWrite(`${path.basename(name)}_${l}${path.extname(name)}`, leftPage);
                    onWrite(`${path.basename(name)}_${r}${path.extname(name)}`, rightPage);
                } else {
                    onWrite(name, pipeline.clone());
                }
            })(name));
    }));
};
