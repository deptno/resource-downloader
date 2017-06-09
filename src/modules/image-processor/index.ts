import * as sharp from 'sharp';
import * as path from 'path';
import * as bmp from 'bmp-js';

export const splitIfWidthBiggerThenHeight =
    async (ext: string, stream: NodeJS.ReadableStream, rightFirst?: boolean): Promise<NodeJS.ReadableStream[]> => {
        const pipeline = sharp();

        try {
            stream.pipe(pipeline);
            try {
                const {width, height} = await metadata(ext, pipeline);

                if (width > height) {
                    const half = Math.floor(width / 2);
                    const leftPage = pipeline.clone().extract({left: 0, top: 0, width: half, height});
                    const rightPage = pipeline.clone().extract({left: half, top: 0, width: half, height});

                    if (!rightFirst) {
                        return [leftPage, rightPage];
                    } else {
                        return [rightPage, leftPage];
                    }
                } else {
                    return [pipeline.clone()];
                }
            } catch(ex) {
                const type = supportTypes.find(type => type.format === ext);

                if (!type) {
                    throw `unsupported type ${ext}`;
                }
                return splitIfWidthBiggerThenHeight(ext, type.handler(pipeline.toBuffer()));
            }
        } catch (message) {
            throw new Error(JSON.stringify({message}));
        }
    };

type Metadata = any;
const metadata = async (format: string, pipeline): Promise<Metadata> => {
    try {
        return pipeline.metadata();
    } catch(ex) {
        console.error(ex);
        throw `unsupported type ${format}`;
    }
};

interface SupportTypes {
    format: '.bmp';
    handler(): Promise<NameStream>;
}
const supportTypes = [{
    format: '.bmp',
    handler(buffer) {
        const decoded = bmp.decode(buffer);
        const {width, height, data} = decoded;

        return data;
    }
}];
