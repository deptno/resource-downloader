import axios, {AxiosInstance, AxiosResponse} from 'axios';
import {JSDOM} from 'jsdom';
import {parse} from 'url';
import SequentialQueue from 'sequential-queue';

const queue = new SequentialQueue();

export class Fetcher {
    private _fetch: AxiosInstance;
    private _initialPath: string;
    private _domCache = {};

    constructor(baseURL) {
        const {protocol, hostname, pathname} = parse(baseURL);
        this._initialPath                    = pathname;
        this._fetch                          = axios.create({baseURL: [protocol, hostname].join('//')});
    }

    async dom(url = this._initialPath): Promise<Document> {
        if (this._domCache[url]) {
            return this._domCache[url];
        }
        const {status, data} = await queue.push(() => this._fetch.get(url));
        if (status >= 400) {
            console.error(`[error] status ${status}`);
            throw [];
        }
        return this._domCache[url] = new JSDOM(data).window.document;
    }

    static async images(urls: string[]) {
        return queue.push(() =>
            axios.all<AxiosResponse>(
                urls.map(url =>
                    axios({ url, responseType: 'stream' }).catch(err => null)
                )
            )
        )
    };

    static async fetch<T>(url: string): Promise<{data: T}&AxiosResponse> {
        return queue.push(() => axios.get(url).catch(err => null));
    }
}
