import Cli from './modules/cli';
import {readConfig} from './modules/config-loader';
import {logger} from './modules/logger';

process.on('SIGINT', _ => logger.flush().pipe(process.stdout));

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
