module shell{
    export class HttpRequest extends egret.URLLoader {
		private _url: string;
		private _completeCaller: any;
		private _completeMethod: Function;
		constructor() {
			super();
		}

		public request(url: string, caller: any=null, method: Function=null, requestMethod: string = egret.URLRequestMethod.POST, data: any = null) {
			this._url = url;
			this._completeCaller = caller;
			this._completeMethod = method;
			this.dataFormat = egret.URLLoaderDataFormat.TEXT;

			var urlRequest: egret.URLRequest = new egret.URLRequest(url);
			urlRequest.method = requestMethod;
			if (data) {
				var str: string = "";
				for (var key in data) {
					str += (key + '=' + data[key] + '&');
				}
				var variables: egret.URLVariables = new egret.URLVariables(str);
				urlRequest.data = variables;
			}
			this.addEventListener(egret.Event.COMPLETE, this.onLoadComplete, this);
			this.addEventListener(egret.IOErrorEvent.IO_ERROR, this.onLoadError, this);
			this.load(urlRequest);
		}

		private onLoadComplete(e: egret.Event) {
			this.removeEventListener(egret.Event.COMPLETE, this.onLoadComplete, this);
			this.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.onLoadError, this);
			if (!this._completeMethod) return;
			this._completeMethod.call(this._completeCaller, JSON.parse(this.data))
			this._completeMethod = this._completeCaller = null;
		}

		private onLoadError(e: egret.IOErrorEvent) {
			this.removeEventListener(egret.Event.COMPLETE, this.onLoadComplete, this);
			this.removeEventListener(egret.IOErrorEvent.IO_ERROR, this.onLoadError, this);
			egret.error("Http错误:", this._url);
		}
	}
}