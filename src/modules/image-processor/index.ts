import * as sharp from 'sharp';
import * as path from 'path';

interface NameStream {
    name: string;
    data: NodeJS.ReadableStream;
}
const splitIfWidthBiggerThenHeight =
    async (name: string, stream: NodeJS.ReadableStream, rightFirst?: boolean): Promise<NameStream[]> => {
        const pipeline = sharp();
        const [l, r] = !rightFirst ? [0, 1] : [1, 0];

        stream.pipe(pipeline);

        try {
            const basename = path.basename(name);
            const dotExt = path.extname(name);
            const {width, height} = await metadata(dotExt.slice(1), pipeline);
            const ret = [];

            if (width > height) {
                const half = Math.floor(width / 2);
                const leftPage = pipeline.clone().extract({left: 0, top: 0, width: half, height});
                const rightPage = pipeline.clone().extract({left: half, top: 0, width: half, height});

                ret.push({name: `${basename}_${l}${dotExt}`, data: leftPage});
                ret.push({name: `${basename}_${r}${dotExt}`, data: rightPage});
            } else {
                ret.push({name, data: pipeline.clone()});
            }

            return ret;
        } catch (message) {
            throw new Error(JSON.stringify({name, message}))
        }
    };

type Metadata = any;
const metadata = async (format: string, pipeline): Promise<Metadata> => {
    try {
        return pipeline.metadata();
    } catch(ex) {
        const type = supportTypes.find(type => type.format === format);

        if (!type) {
            throw `unsupported type ${format}`;
        }

        return type.handler();
    }
};

interface SupportTypes {
    format: string;
    handler(): Promise<any>;
}
const supportTypes = [{
    format: 'bmp',
    handler() {

    }
}];
