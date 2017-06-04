import * as chalk from 'chalk';
import Cli from './modules/cli';
import {readConfig} from './modules/config-loader';
import {logger} from './modules/logger';
import {NAME, REPOSITORY, VERSION} from './constants';

console.log(`${chalk.yellow(NAME)} v${VERSION}`);

process.on('beforeExit', _ => {
    logger.write(chalk.yellow(`if you have any [ISSUE], feel free to let us know. [${REPOSITORY}/issue/new]`));
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

