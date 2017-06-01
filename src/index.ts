import * as chalk from 'chalk';
import * as figlet from 'figlet';
import * as clear from 'clear';
import {name, version} from '../package.json';
import CLI from './modules/interface';
import {readConfig} from './modules/config-loader';

clear();
console.log(
    chalk.yellow(figlet.textSync(name, {horizontalLayout: 'default', verticalLayout: 'default'})),
    `\n${chalk.red(version)}`
);

!async function() {
    try {
        const cli = new CLI(await readConfig());
        while (true) {
            const siteName = await cli.select();
            const site = cli.getSite(siteName);
            await site.stage();
        }
    } catch(ex) {
        console.error(ex);
        process.exit(1);
    }
}();

