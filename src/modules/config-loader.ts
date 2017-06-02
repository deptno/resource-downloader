import * as chalk from 'chalk';
import {Fetcher} from './fetcher';
import {join} from 'path';

const remoteConfig      = async (remoteConfigs): Promise<Sites> => {
    try {
        const {status, data} = await Fetcher.fetch<Config>(remoteConfigs);
        if (status === 200) {
            if (data.remoteConfig) {
                data.push(...await remoteConfig(data.remoteConfigs));
            }
        }
        return data.sites.map(site => ({...site, name: `${site.name} [${remoteConfigs}]`}));
    } catch (ex) {
        console.error('fail to fetch remote configs: ', ex);
        return [];
    }
};
export const readConfig = async (): Promise<Sites> => {
    const configFile = 'rdconfig.json';
    const configPath = join(process.env.HOME, '.config', configFile);
    try {
        const {sites, remoteConfigs} = require(configPath);

        if (remoteConfigs) {
            const results = await Promise.all<Sites>(remoteConfigs.map(remoteConfig));
            results.forEach(remoteSites => sites.push(...remoteSites));
        }
        return sites;
    } catch (ex) {
        throw `${chalk.red(`${configFile} not found`)}
    
    sample ${configFile} download
    
    ${chalk.yellow('[curl]')}
    mkdir -p ~/.config && curl -o ${configPath} https://gist.githubusercontent.com/deptno/7d652050fdecaf6e91a4411b8f8f39a5/raw/69854915982bc5b8f26e72481d91381d2ab9c026/rdconfig.json`;
    }
};
