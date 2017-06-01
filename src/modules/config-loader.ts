import * as chalk from 'chalk';
import {Fetcher} from './fetcher';
import {join} from 'path';

const remoteConfig = async (remoteConfigs): Promise<Sites> => {
    try {
        const {status, data} = await Fetcher.fetch<Config>(remoteConfigs);
        if (status === 200) {
            if (data.remoteConfig) {
                data.push(...await remoteConfig(data.remoteConfigs));
            }
        }
        return data;
    } catch(ex) {
        console.error('fail to fetch remote configs: ', ex);
        return [];
    }
};
export const readConfig = async (): Promise<Sites> => {
    try {
        const {sites, remoteConfigs} = require(join(process.env.HOME, '.config', 'wrdconfig.json'));

        if (remoteConfigs) {
            const results = await remoteConfigs.map(remoteConfig);
            results.forEach(remoteSites => sites.push(...remoteSites));
        }
        return sites;
    } catch(ex) {
        throw `${chalk.red('.wrdconfig.json not found')}
    
    sample wrdconfig.json download
    
    ${chalk.yellow('[curl]')}
    mkdir -p ~/.config && curl -o ~/.config/wrdconfig.json https://gist.githubusercontent.com/deptno/7d652050fdecaf6e91a4411b8f8f39a5/raw/e7a139c31f73d05383ceef401b991f91adc0f2d5/wrdconfig.json`;
    }
};
