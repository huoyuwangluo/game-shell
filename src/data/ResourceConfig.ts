module shell {
    export class ResourceConfig {
        private _manifest: any;
        private _resource: any;
        constructor() {
        }

        public async initialize(version: string, method?: Function, caller?: any): Promise<any> {
            var manifestName:string=`${version}/manifest.json`;
            //if((window as any).config.incrementalupdate) manifestName=manifestName+(version?('_'+version):'');
            this._manifest = await this.loadConfig(`${manifestName}?${(window as any).config.version_assets}${(window as any).config.version_assetscript}`) as string;
            //if((window as any).config.incrementalupdate) this._resource = await this.loadConfig(`resource${(version?('_'+version):'')}.json?${(window as any).config.version_assets}${(window as any).config.version_resource}`) as string;
            if(method) {
                method.call(caller);
            }
            return Promise.resolve();
        }

        private async loadConfig(name: string) {
            return new Promise(function (r1, r2) {
                var xhr = new XMLHttpRequest();
                xhr.open('GET', `./${name}`, true);
                xhr.addEventListener("load", function () {
                    xhr.removeEventListener('load', (arguments.callee as any), false);
                    r1(JSON.parse(xhr.response.toString()));
                });
                xhr.send(null);
            });
        }

        public get manifest(): any {
            return this._manifest;
        }

        public get resource(): any {
            return this._resource;
        }
    }

    export let resourceConfig = new ResourceConfig();
}