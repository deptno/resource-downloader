import SiteContainer from './site-container';
import Questioner from './questioner';

export default class CLI {
    constructor(private _sites: Sites) {
    }

    async select() {
        const sites  = this._sites.map(site => ({
            name:  site.name,
            value: {
                name: site.name,
                url: site.url
            } as any
        }));
        const result = await Questioner.askSelection({
            type:      'list',
            message:   'select site',
            choices:   sites,
            paginated: true,
            pageSize:  20
        }, true);
        return result;
    }

    getSite(site: ChoiceOptionValue) {
        const found = this._sites.find(siteInfo => siteInfo.name === site.name);
        if (!found) {
            throw 'check site name';
        }
        return new SiteContainer(found);
    }
}

