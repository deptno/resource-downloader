import SiteContainer from './site-container';
import Questioner from './questioner';

export default class CLI {
    constructor(private _sites: Sites) {
    }

    async select() {
        const sites  = this._sites.map(site => ({
            name:  site.name,
            value: site.url
        }));
        const answer = await Questioner.askSelection({
            type:      'list',
            name:      'url',
            message:   'select site',
            choices:   sites,
            paginated: true,
            pageSize:  20
        }, true);
        return answer;
    }

    getSite(site) {
        const found = this._sites.find(siteInfo => siteInfo.url === site.url);
        if (!found) {
            throw 'check site name';
        }
        return new SiteContainer(found);
    }
}

