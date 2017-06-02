import * as chalk from 'chalk';
import {name, version} from '../package.json';
import CLI from './modules/interface';
import {readConfig} from './modules/config-loader';

console.log(`${chalk.yellow(name)} v${version}`);

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

