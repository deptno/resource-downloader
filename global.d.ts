declare module "*package.json" {
    interface packageJson {
        name: string;
        version: string;
        repository: string;
    }
    const resource: packageJson;
    export = resource;
}
declare module "*.srdconfig.json" {
    export const sites: Sites;
    export const remoteConfigs: string[];
}
