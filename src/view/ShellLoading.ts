module shell {
    export class ShellLoading extends LoginBaseView {

        public bar: eui.Image;
        public progress: eui.Image;
        public logo: eui.Image;
        public tip: eui.Label;

        private _progress: number;
        private _progressWidth: number;
        constructor() {
            super();
            this.skinName = `skin.ShellLoadingSkin`;
            //this.createChildren();
        }

        public initialize() { }

        protected createChildren() {
            this._progressWidth = this.progress.width;
            try {
                this.logo.source = (window as any).config.logourl.replace('shell/', "");
            } catch (e) { };
        }

        private static _instance: ShellLoading;
        public static get instance(): ShellLoading {
            if (!ShellLoading._instance) {
                ShellLoading._instance = new ShellLoading();
            }
            return ShellLoading._instance;
        }

        public destory() {
            RES.destroyRes('logo.png', true);
            RES.destroyRes('img_lodingProgressSmallBg.png', true);
            RES.destroyRes('img_lodingSmallProgress.png', true);
        }

        /**显示加载页面 */
        public show(title: string): void {
            egret.log("showShellLoading");
            this.tip.text = title;
            this._progress = 0;
            shell.viewManager.stage.addChild(this);
            shell.viewManager.stage.addEventListener(egret.Event.RESIZE, this.resizeHandler, this);
            this.updateHandler();
            this.resizeHandler(null)
        }

        public hide(): void {
            egret.log("hideShellLoading");

            shell.viewManager.stage.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.refeshHandler, this);
            shell.viewManager.stage.removeEventListener(egret.Event.RESIZE, this.resizeHandler, this);
            if (this.parent) {
                this.parent.removeChild(this);
            }
        }

        /**更新进度显示 */
        private _lastLogLoadingTime: number = 0;
        public updateProgress(value: number): void {
            this._progress = value;
            this.updateHandler();
            var now: number = egret.getTimer();
            if (now - this._lastLogLoadingTime > 3000 || value >= 1) {
                if (this._lastLogLoadingTime > 0 || value >= 1) {
                    shell.LoginData.instance.logLoading(shell.LoginData.instance.account, LogLogingType.LOAD_GAME_SCRIPT, Math.floor(value * 100));
                }
                this._lastLogLoadingTime = now;
            }
        }
        public showTip(content: string) {
            this.tip.text = content;
        }
        public showRefeshState() {
            this.tip.text = "加载失败...请点击刷新页面重试...";
            shell.viewManager.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.refeshHandler, this);
        }

        private updateHandler() {
            this.progress.width = (this._progress * this._progressWidth) >> 0;
        }

        private refeshHandler() {
            window.location.reload();
        }

        public resizeHandler(e: egret.Event): void {
            var w: number = shell.viewManager.stage.stageWidth;
            var h: number = shell.viewManager.stage.stageHeight;
            this.width = w
            this.height = h;

            this.bar.x = w / 2 - this.bar.width / 2;
            this.progress.x = w / 2 - this._progressWidth / 2;
        }
    }
}