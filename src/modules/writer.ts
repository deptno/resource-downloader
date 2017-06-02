import * as fs from 'fs';
import {Zip} from './downloader/zip-images';
import * as sharp from 'sharp';
import * as path from 'path';

export const writeZip = async (filename, streams, split?) => {
    const output    = fs.createWriteStream(filename);
    const zip       = new Zip(output);

    await Promise.all(streams.map(async response => {
        const name   = path.basename(decodeURI(response.config.url));
        const stream = response.data;

        if (split) {
            const pipeline = sharp();

            stream.pipe(pipeline);
            return pipeline.metadata().then(({width, height}) => {
                if (width > height) {
                    const half = Math.floor(width / 2);
                    const leftPage = pipeline.clone().extract({left: 0, top: 0, width: half, height});
                    const rightPage = pipeline.clone().extract({left: half, top: 0, width: half, height});

                    zip.append(`${name}_left.jpg`, leftPage);
                    zip.append(`${name}_right.jpg`, rightPage);
                } else {
                    zip.append(name, pipeline.clone());
                }
            });
        } else {
            zip.append(name, stream);
        }
    }));

    zip.finalize();
};

