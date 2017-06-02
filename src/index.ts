import * as chalk from 'chalk';
import {name, version} from '../package.json';
import Cli from './modules/cli';
import {readConfig} from './modules/config-loader';

console.log(`${chalk.yellow(name)} v${version}`);

!async function() {
    try {
        const cli = new Cli(await readConfig());
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

