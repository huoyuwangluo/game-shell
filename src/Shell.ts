module shell {
    export class ShellVersionControl implements RES.VersionController {
        private _shellPath: string;
        private _resourceOtherPath: string;
        private static _instance: ShellVersionControl;
        public static getInstance(): ShellVersionControl {
            if (!this._instance) this._instance = new ShellVersionControl();
            return this._instance;
        }

        public get shellPath(): string {
            return this._shellPath;
        }
        public get resourceOtherPath(): string {
            return this._resourceOtherPath;
        }

        public async init(): Promise<any> {
            this._shellPath = (window as any).config.resource_shell;
            if (this._shellPath) {
                this._shellPath += '/';
            } else {
                this._shellPath = 'shell/';
            }
            if (!!(window as any).config.debug_shell) {
                this._shellPath = '';
            }
            this._resourceOtherPath = (window as any).config.resource_other;
            if (this._resourceOtherPath) {
                this._resourceOtherPath += '/';
            } else {
                this._resourceOtherPath = 'resource_other/';
            }
            return Promise.resolve();
        }

        public getVirtualUrl(url: string, versionControl?: string): string {
            if (!url) return url;
            if (this._shellPath) {
                if (url.indexOf(this._shellPath) != 0) {
                    url = this._shellPath + url;
                }
            }
            if (url.indexOf('?') == -1) url += ("?" + (versionControl ? versionControl : (window as any).config.vershell));
            return url;
        }

        public getGameVirtualUrl(url: string, versionControl?: string) {
            if ((window as any).config.incrementalupdate) {
                if (resourceConfig.resource[url]) {
                    url = resourceConfig.resource[url];
                }
                return `${url}`;
            }
            if (!url) return url;
            var versionMain: string = (window as any).config.version + '/';
            if (versionMain) {
                if (url.indexOf(versionMain) != 0) {
                    url = versionMain + url;
                }
            }
            if (url.indexOf('?') == -1) url += ("?" + (versionControl ? versionControl : (window as any).config.version_assets));
            return url;
        }
    }

    export class AssetAdapter implements eui.IAssetAdapter {
        private _uiResLib: any = {}
        /**
         * @language zh_CN
         * 解析素材
         * @param source 待解析的新素材标识符
         * @param compFunc 解析完成回调函数，示例:callBack(content:any,source:string):void;
         * @param thisObject callBack的 this 引用
         */
        public getAsset(source: string, compFunc: Function, thisObject: any): void {
            function onGetRes(data: any): void {
                compFunc.call(thisObject, data, source);
            }
            if (RES.hasRes(source)) {
                let data = RES.getRes(source);
                if (data) {
                    onGetRes(data);
                }
                else {
                    RES.getResAsync(source, onGetRes, this);
                }
            } else {
                RES.getResByUrl(source, onGetRes, this, RES.ResourceItem.TYPE_IMAGE);
            }
        }
    }
    export class ThemeAdapter implements eui.IThemeAdapter {
        /**
         * 解析主题
         * @param url 待解析的主题url
         * @param compFunc 解析完成回调函数，示例:compFunc(e:egret.Event):void;
         * @param errorFunc 解析失败回调函数，示例:errorFunc():void;
         * @param thisObject 回调的this引用
         */
        public getTheme(url: string, compFunc: Function, errorFunc: Function, thisObject: any): void {
            function onGetRes(e: string): void {
                compFunc.call(thisObject, e);
            }
            function onError(e: RES.ResourceEvent): void {
                if (e.resItem.url == url) {
                    RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, onError, null);
                    errorFunc.call(thisObject);
                }
            }
            RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, onError, null);
            RES.getResByUrl(url, onGetRes, this, RES.ResourceItem.TYPE_TEXT);
        }
    }

    export class LogLogingType {

        public static AUTH_FAIL: number = 1; //验证失败
        public static AUTH_SUCCESS: number = 2; //验证成功
        public static LOAD_GAME_SCRIPT: number = 3; //加载游戏代码进度

    }

    export class Shell extends egret.DisplayObjectContainer {
        private _theme: eui.Theme;
        private _logo: egret.Bitmap;
        public constructor() {
            super();
            console.log(egret.Capabilities.engineVersion);
            this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);
        }

        private onAddToStage(event: egret.Event): void {
            this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAddToStage, this);

            parseLogoData(this, (texture: egret.Texture) => {
                this._logo = new egret.Bitmap(texture);
                this.addChild(this._logo);
                this._logo.x = this.stage.stageWidth / 2 - this._logo.width / 2;
                this._logo.y = this.stage.stageHeight / 2 - this._logo.height / 2;
                (window as any).removeLogo = (() => {
                    if (this._logo.parent) {
                        this._logo.parent.removeChild(this._logo);
                        this._logo.texture.dispose();
                    }
                }).bind(this);
            });
            this.initialize();
        }

        private async wait(time: number) {
            return new Promise((r1, r2) => {
                egret.setTimeout(function () {
                    r1();
                }, this, time);
            });
        }

        private async initialize() {
            shell.layerManager.initialize(this.stage);
            egret.ImageLoader.crossOrigin = "anonymous";
            shell.viewManager.initialize(this.stage);
            shell.tipManager.initialize(this.stage);
            egret.registerImplementation("eui.IAssetAdapter", new shell.AssetAdapter());
            egret.registerImplementation("eui.IThemeAdapter", new shell.ThemeAdapter());
            RES.registerVersionController(shell.ShellVersionControl.getInstance());
            await shell.ShellVersionControl.getInstance().init();
            await this.loadResConfig();
            if ((window as any).config.debug_shell) await this.loadTheme();
            shell.ShellLoading.instance.initialize();
            egret.log('初始化登录相关...');
            shell.viewManager.openView(shell.LoginWaitView);
            if (!platform.sdk.enabled) {
                // var res: any = { model: 'fgfgfgPACT00 ererer' };
                // for (var value of ['PAAM00', 'PAAT00', 'PACM00', 'PACT00', 'CPH1831', 'CPH1833']) {
                //     if (new RegExp(value, 'gi').test(res.model)) {
                //         platform.sdk.uiOffsetY = 80;
                //         break;
                //     }
                // }
                shell.viewManager.onViewCloseOnce(shell.LoginView, this, this.showLoginServer);
                shell.viewManager.openView(shell.LoginView, '');
                try { (window as any).removeLogo() } catch (e) { };
            } else {
                platform.sdk.start(this, () => {
                    this.showLoginServer(platform.sdk.roleId);
                });
            }
        }

        private async loadResConfig(): Promise<any> {
            return new Promise(function (resolve, reject) {
                RES.addEventListener(RES.ResourceEvent.CONFIG_COMPLETE, () => {
                    resolve();
                }, this);
                RES.loadConfig(`resource/default.res.json?shell${(window as any).config.vershell}`, `resource/`);
            });
        }

        private async loadTheme() {
            var that = this;
            return new Promise((resolve, reject) => {
                let theme = new eui.Theme(`resource/default.thm.json?shell${(window as any).config.vershell}`, that.stage);
                theme.addEventListener(eui.UIEvent.COMPLETE, () => {
                    resolve();
                }, that);
            })
        }

        private async showLoginServer(id: string) {
            egret.log('用户信息登录...' + id);
            var authData: any = await shell.LoginData.instance.userLogin(id);
            if (authData.code != 0) {
                alert('验证错误...' + JSON.stringify(authData));
                egret.error('验证错误:', authData);
                return;
            }
            var first: any = await shell.LoginData.instance.requestServerList(platform.sdk ? platform.sdk.roleId : shell.LoginData.instance.authData.identityId);
            if (first) {
                if (shell.LoginData.instance.serverList.selected.status != shell.ServerItem.OPEN) {
                    shell.tipManager.show("服务器维护中!  请稍后尝试...", 0xFF3300, 2000);
                    this.showLoginServerView();
                    return;
                }
                shell.LoginData.instance.reportSelectServer();
                this.enterGame();
                return;
            }
            this.showLoginServerView();
            try { (window as any).removeLogo() } catch (e) { }
        }

        private showLoginServerView() {
            shell.viewManager.closeView(shell.LoginWaitView);
            shell.viewManager.openView(shell.LoginServerView, shell.LoginData.instance.authData);
            if ((window as any).config.noticepop) shell.viewManager.openView(shell.NoticeView);
            shell.viewManager.onViewCloseOnce(shell.LoginServerView, this, this.enterGame);
        }

        private async enterGame() {
            shell.ShellLoading.instance.show('加载游戏逻辑...');
            shell.ShellLoading.instance.updateProgress(1);
            egret.log('进入游戏...');
            shell.viewManager.destory();
            (window as any).config.logindata = shell.LoginData.instance;
            (window as any).config.stage = this.stage;
            if (this.parent) {
                this.parent.removeChild(this);
            }
            await this.wait(1000 / 30);
            egret.log('加载游戏基本配置....');
            (window as any).config.version = (window as any).config.debug ? "" : shell.LoginData.instance.serverList.selected.version;
            //兼容老版本
            (window as any).config.ver = (window as any).config.version;

            if ((window as any).config.debug) {
                await this.loadGameScript();
                this.initGame();
            } else {
                (window as any).skin = null;
                (window as any).skins = null;
                (window as any).onGameEnter(() => {
                    this.initGame();
                });
            }
        }

        private initGame() {
            try {
                shell.ShellLoading.instance.showTip('正在初始化游戏...');
                var MainClass = egret.getDefinitionByName('game.Main');
                //egret.log('game.Main:', MainClass);
                var main = new MainClass();
                //shell.Loading.instance.hide();
                egret.log('初始化游戏完成....');
                // shell.ShellLoading.instance.hide();
                egret.log("邀请者1111111111111111==", platform.sdk.shareServerId);
                egret.log("邀请者2222222222222222==", platform.sdk.shareUserId);
                egret.log("被邀请者1111111111111111==", shell.LoginData.instance.serverList.selected.sid);
                egret.log("被邀请者2222222222222222==", shell.LoginData.instance.authData.identityId);
                if (platform.sdk && platform.sdk.shareServerId && platform.sdk.shareUserId) {                    
                    shell.LoginData.instance.requestWeiXin(platform.sdk.shareServerId, platform.sdk.shareUserId, shell.LoginData.instance.serverList.selected.sid, shell.LoginData.instance.authData.identityId);
                }
            } catch (e) {
                alert('游戏主逻辑初始化失败,点击刷新页面!', );
                //window.location.reload();
            }
        }

        private async loadGameScript() {
            var that = this;
            return new Promise((resolve, reject) => {
                var version: string = '';
                if ((window as any).config.version) {
                    version = (window as any).config.version;
                }
                version = (window as any).config.debug ? '' : '';
                var url = version + '/' + 'manifest.json?' + (window as any).config.version_assets + "" + (window as any).config.version_assetscript;
                //console.log('url:' + url);
                shell.jsonLoader.start(url, this, (manifest: any) => {
                    if ((window as any).config.debug) {
                        manifest.initial = that.filterGameJsFile(manifest.initial);
                    }
                    for (var key in manifest.initial) {
                        manifest.initial[key] = version + '/' + manifest.initial[key] + '?' + (window as any).config.version_assets + "" + (window as any).config.version_assetscript;
                    }
                    for (var key in manifest.game) {
                        manifest.game[key] = version + '/' + manifest.game[key] + '?' + (window as any).config.version_assets + "" + (window as any).config.version_assetscript;
                    }
                    shell.scriptLoaderGroup.start(manifest.initial, 0, this, function (status: boolean) {
                        function completeHandler(status: boolean) {
                            if (!status) {
                                shell.ShellLoading.instance.showRefeshState();
                                return;
                            }
                            resolve();
                        }
                        function progressHandler(progressValue: number) {
                            shell.ShellLoading.instance.updateProgress(0.5 + progressValue * 0.5);
                        }
                        if (manifest.game.length > 1) {
                            shell.scriptLoaderGroup.start(manifest.game, 10, this, completeHandler, progressHandler);
                        } else {
                            shell.scriptLoaderQueue.start(manifest.game, this, completeHandler, progressHandler);
                        }
                    }, function (progressValue: number, v: number) {
                        shell.ShellLoading.instance.updateProgress(progressValue * 0.5);
                    });
                });
            })
        }

        /**检查并过滤不需要加载的JS文件 */
        private filterGameJsFile(files: string[]): string[] {
            var names = ["egret", "egret.web", "res", "assetsmanager", "eui", "game", "decoder", "sdk"];
            var filterlist = [];
            for (var libScriptPath of files) {
                var libScriptName: string = libScriptPath.substring(libScriptPath.lastIndexOf('/') + 1, libScriptPath.length);
                libScriptName = libScriptName.replace(".min.js", "");
                libScriptName = libScriptName.replace(".js", "");
                var has: boolean = false;
                for (var name of names) {
                    if (name == libScriptName) {
                        has = true;
                        break;
                    }
                }
                if (!has) {
                    console.log("filter", libScriptPath);
                    filterlist.push(libScriptPath);
                }
            }
            return filterlist;
        }
    }

}