import * as sharp from 'sharp';
import * as path from 'path';
import * as bmp from 'bmp-js';

export const splitIfWidthBiggerThenHeight =
    async (filename: string, stream: NodeJS.ReadableStream, rightFirst?: boolean): Promise<NameStream[]> => {
        const pipeline = sharp();
        const [l, r] = !rightFirst ? [0, 1] : [1, 0];

        stream.pipe(pipeline);

        try {
            const parsed = path.parse(filename);
            const name = parsed.name;
            const ext = parsed.ext.slice(1);
            const ret = [];
            try {
                const {width, height} = await metadata(ext, pipeline);

                if (width > height) {
                    const half = Math.floor(width / 2);
                    const leftPage = pipeline.clone().extract({left: 0, top: 0, width: half, height});
                    const rightPage = pipeline.clone().extract({left: half, top: 0, width: half, height});

                    ret.push({name: `${name}_${l}.${ext}`, data: leftPage});
                    ret.push({name: `${name}_${r}.${ext}`, data: rightPage});
                } else {
                    ret.push({name: filename, data: pipeline.clone()});
                }
            } catch(ex) {
                const type = supportTypes.find(type => type.format === ext);

                if (!type) {
                    throw `unsupported type ${ext}`;
                }

                return splitIfWidthBiggerThenHeight(filename, type.handler(pipeline.toBuffer()));
            }
            return ret;
        } catch (message) {
            throw new Error(JSON.stringify({filename, message}))
        }
    };

type Metadata = any;
const metadata = async (format: string, pipeline): Promise<Metadata> => {
    try {
        return pipeline.metadata();
    } catch(ex) {
        throw `unsupported type ${format}`;
    }
};

interface SupportTypes {
    format: string;
    handler(): Promise<NameStream>;
}
const supportTypes = [{
    format: 'bmp',
    handler(buffer) {
        const decoded = bmp.decode(buffer);
        const {width, height, data} = decoded;

        return data;
    }
}];
