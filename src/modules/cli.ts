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
        const answer = await Questioner.ask({
            type:      'list',
            name:      'name',
            message:   '사이트 선택',
            choices:   sites,
            paginated: true,
            pageSize:  30
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

