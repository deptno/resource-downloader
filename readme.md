# web-resource-downlaoder

## install
`npm -g i rd`

## feature
* command line interface
* local config, multiple remote configs
* download multiple image resource -> zip
* wide(width > height) images -> split half / half
    * swap split file order(split: left -> right, splitRight right -> left)
* async operation(via stream);

## config
### rdconfig.json
> sample
```json
{
    "sites": [{
        "name": "Top Box Office (US)",
        "url":  "http://www.imdb.com/chart/boxoffice",
        "stages": [{
            "type": "list",
            "selector": "#boxoffice .titleColumn a",
            "attrs": {
                "value": "href"
            },
            "message": "select movie",
            "operation": {
                "type": "next"
            }
        }, {
            "type": "download",
            "selector": ".poster img",
            "attrs": {
                "value": "src"
            },
            "prefixes": {
                "doing": "[receiving] ",
                "done": "[received] ${0}"
            },
            "operation": {
                "type": "prev"
            }
        }]
    }],
    "remoteConfigs": []
}
```

### typescript definition
```typescript
interface Config {
    sites: Sites;
    remoteConfigs: string[];
}
```
[Sites](https://github.com/deptno/resource-downloader/blob/master/index.d.ts#L15-19)

remoteConfigs is url indicates `rdconfig.json` format text

### loading order
1. ./rdconfig.json
2. ~/.config/rdconfig.json

## etc
[milestone](https://github.com/deptno/resource-downloader/projects)

## license
Apache 2.0
