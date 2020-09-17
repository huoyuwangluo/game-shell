module shell {

    class BaseLoader extends egret.HttpRequest {
        protected _retryCount: number = 2;
        protected _times: number;
        protected _cururl: string;
        protected _caller: any;
        protected _complete: Function;
        protected _progress: Function;
        constructor() {
            super();
        }

        public reset() {
            this._cururl = '';
            this.removeEventListener(egret.Event.COMPLETE, this.completeHandler, this);
            this.removeEventListener(egret.ProgressEvent.PROGRESS, this.progressHandler, this);
            this.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.errorHandler, this);
            this._caller = null;
            this._complete = null;
            this._progress = null;
            this.response = null;
            this._retryCount = 2;
            this._times = 0;
        }

        public start(url: string, caller: any = null, complete: Function = null, progress: Function = null, ...args): BaseLoader {
            this._caller = caller;
            this._complete = complete;
            this._progress = progress;
            this._cururl = url;
            this.responseType = egret.HttpResponseType.TEXT;
            this._times = 0;
            this.starLoad();
            return this;
        }

        protected starLoad() {
            this.open(this._cururl, egret.HttpMethod.GET);
            this.setRequestHeader("Content-Type", "text/plain");
            this.addEventListener(egret.Event.COMPLETE, this.completeHandler, this);
            if (this._progress) this.addEventListener(egret.ProgressEvent.PROGRESS, this.progressHandler, this);
            this.addEventListener(egret.IOErrorEvent.IO_ERROR, this.errorHandler, this);
            this.send();
        }

        protected progressHandler(e: egret.ProgressEvent) {
            this._progress.call(this._caller, e.bytesLoaded / e.bytesTotal);
        }

        protected completeHandler(e: Event): void {
            this.removeEventListener(egret.Event.COMPLETE, this.completeHandler, this);
            this.removeEventListener(egret.ProgressEvent.PROGRESS, this.progressHandler, this);
            this.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.errorHandler, this);
            this.dataHandler(this.response);
        }

        protected dataHandler(response: any) {
            this._complete.call(this._caller, response);
        }

        protected errorHandler(e: Event) {
            console.log('加载失败:', this._cururl)
            if (this._times >= this._retryCount) {
                this.removeEventListener(egret.Event.COMPLETE, this.completeHandler, this);
                this.removeEventListener(egret.ProgressEvent.PROGRESS, this.progressHandler, this);
                this.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.errorHandler, this);
                this._complete.call(this._caller, false);
                return;
            }
            this._times++;
            console.log('正在重试:', this._cururl);
            this.starLoad();
        }
    }

    class JSONLoader extends BaseLoader {
        protected dataHandler(response: any): void {
            this._complete.call(this._caller, JSON.parse(response));
        }
    }

    class ScriptLoader {
        public start(url: string, caller: any = null, complete: Function = null): ScriptLoader {
            var s = document.createElement('script');
            s.async = false;
            s.src = url;
            s.addEventListener('load', function () {
                s.parentNode.removeChild(s);
                s.removeEventListener('load', (arguments as any).callee, false);
                if (complete) complete.call(caller);
            }, false);
            document.body.appendChild(s);
            return this;
        }
    }
    export var textLoader: BaseLoader = new BaseLoader();
    export var jsonLoader: JSONLoader = new JSONLoader();
    export var scriptLoader: ScriptLoader = new ScriptLoader();

    class ScriptLoaderQueue {
        private _caller: any;
        private _complete: Function;
        private _progress: Function;
        private _total: number;
        public start(list: string[], caller: any, complete: Function, progress: Function = null) {
            this._total = list.length;
            this._caller = caller;
            this._complete = complete;
            this._progress = progress;
            this.loadHandler(list);
        }

        private loadHandler(list: string[]) {
            if (!list.length) {
                var method=this._complete;
                var caller=this._caller;
                this._complete = this._caller = null;
                method.call(caller, true);
                return;
            }
            if (this._progress) {
                this._progress.call(this._caller, (this._total - list.length + 1) / this._total, list.length % 2 ? 0 : 1);
            }
            scriptLoader.start(list.shift(), this, function (status: boolean) {
                this.loadHandler(list);
            });
        }
    }

    class ScriptLoaderGroup {
        private _caller: any;
        private _complete: Function;
        private _progress: Function;
        private _list: string[];
        private _total: number;
        private _cur: number;
        private _threadTotal: number;
        private _threadCur: number;
        public start(list: string[], thread: number = 0, caller: any, complete: Function, progress: Function = null) {
            this._list = list;
            this._threadTotal = thread ? thread : list.length;
            this._total = list.length;
            this._cur = 0;
            this._caller = caller;
            this._complete = complete;
            this._progress = progress;

            this._threadCur = 0;
            while (this._threadCur < this._threadTotal) {
                if (!this._list.length) break;
                this.addThread();
                this._threadCur++;
            }
        }

        private addThread() {
            new ScriptLoader().start(this._list.shift(), this, this.loadHandler);
        }

        private loadHandler() {
            this._cur++;
            this._threadCur--;
            if (this._cur >= this._total) {
                var method=this._complete;
                var caller=this._caller;
                this._complete = this._caller = null;
                method.call(caller, true);
            } else {
                this._progress.call(this._caller, this._cur / this._total, this._cur % 2 ? 0 : 1);
                if (this._list.length) {
                    while (this._threadCur < this._threadTotal) {
                        if (!this._list.length) break;
                        this.addThread();
                        this._threadCur++;
                    }
                }
            }
        }
    }

    export var scriptLoaderQueue: ScriptLoaderQueue = new ScriptLoaderQueue();
    export var scriptLoaderGroup: ScriptLoaderGroup = new ScriptLoaderGroup();
}