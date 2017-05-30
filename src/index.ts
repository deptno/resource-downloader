import * as chalk from 'chalk';
import * as figlet from 'figlet';
import * as clear from 'clear';
import {name, version} from '../package.json';
import CLI from './modules/interface';
import {join} from 'path';

clear();
console.log(
    chalk.yellow(figlet.textSync(name, {horizontalLayout: 'default', verticalLayout: 'default'})),
    `\n${chalk.red(version)}`
);

try {
    const {sites, remoteConfigs} = require(join(process.env.HOME, '.config', 'wrdconfig.json'));

    !async function main(sites) {
        const cli = new CLI(sites);
        try {
            while (true) {
                const siteName = await cli.select();
                const site = cli.getSite(siteName);
                await site.stage();
            }
        } catch(ex) {
            console.error(ex);
        }
    }(sites);
} catch(ex) {
    console.error(`${chalk.red('.wrdconfig.json not found')}
    
    sample download
    
    ${chalk.yellow('[curl]')}
    mkdir -p ~/.config && wget -o ~/.config/wrdconfig.json https://gist.githubusercontent.com/deptno/7d652050fdecaf6e91a4411b8f8f39a5/raw/e7a139c31f73d05383ceef401b991f91adc0f2d5/wrdconfig.json`);
}

