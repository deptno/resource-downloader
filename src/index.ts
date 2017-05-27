import * as chalk from 'chalk';
import * as figlet from 'figlet';
import * as clear from 'clear';
import {name, version} from '../package.json';
import {sites, remoteConfigs} from '../.srdconfig.json';
import CLI from './modules/interface';

clear();
console.log(
    chalk.yellow(figlet.textSync(name, {horizontalLayout: 'default', verticalLayout: 'default'})),
    `\n${chalk.red(version)}`
);

const killInifiniteLoop = (before = Date.now()) => () => {
        process.exit(1);
    if (Date.now() - before < 1 * 500) {
        console.error('killer');
        process.exit(1);
    }
};
!async function main(sites) {
    const cli = new CLI(sites);
    try {
        while (true) {
            const killer = killInifiniteLoop();

            const siteName = await cli.select();
            const site = cli.getSite(siteName);
            while (true) {
                const result = await site.stage();
                break;
            }

            killer();
        }
    } catch(ex) {
        console.error(ex);
    }
}(sites);
