import SiteContainer from './site-container';
import Questioner from './questioner';

export default class CLI {
    constructor(private _sites: Sites) {
    }

    async select() {
        const sites  = this._sites.map(site => ({
            name:  site.name,
            value: JSON.stringify({
                name: site.url
            })
        }));
        const answer = await Questioner.askSelection({
            type:      'list',
            name:      'name',
            message:   'select site',
            choices:   sites,
            paginated: true,
            pageSize:  20
        }, true);
        return answer;
    }

    getSite(site) {
        const found = this._sites.find(siteInfo => siteInfo.url === site.name);
        if (!found) {
            throw 'check site name';
        }
        return new SiteContainer(found);
    }
}

