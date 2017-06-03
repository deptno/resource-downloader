import * as chalk from 'chalk';
import {name, version} from '../package.json';
import Cli from './modules/cli';
import {readConfig} from './modules/config-loader';
import {logger} from './modules/logger';

console.log(`${chalk.yellow(name)} v${version}`);

process.on('beforeExit', signal => {
    console.log('exit signal: ', signal);
    logger.end();
    logger.pipe(process.stdout);
});

!async function() {
    try {
        const cli = new Cli(await readConfig());
        while (true) {
            const answer = <ChoiceOptionValue>await cli.select();
            const site = cli.getSite(answer);
            await site.stage();
        }
    } catch(ex) {
        console.error(ex);
    }
}();

