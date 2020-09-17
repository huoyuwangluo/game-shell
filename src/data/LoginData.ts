module shell {
	export class LoginData {
		private static _instance: LoginData;
		public static get instance(): LoginData {
			if (!LoginData._instance) {
				LoginData._instance = new LoginData();
			}
			return LoginData._instance;
		}

		private _account: string;
		private _serverList: ServerList;
		private _authData: any;
		private _isRequestServerList: boolean;
		constructor() {

		}

		private getAuthURL(): string {
			return `${(window as any).config.ssl ? 'https' : 'http'}://${(window as any).config.ip}/${(window as any).config.platform}/${(window as any).config.superstart ? 'superauth' : 'auth'}.php`;
		}

		private getLogLoadingURL(): string {
			return `${(window as any).config.ssl ? 'https' : 'http'}://${(window as any).config.ip}/${(window as any).config.platform}/logLoading.php`;
		}

		private getURLParam(repType: string, type: string, userId: string): string {
			if (type) {
				var token_temp: string = encodeURIComponent(platform.sdk.token);
				return `channel=${platform.sdk.channleId}&appId=${platform.sdk.appId}&userId=${userId}&time=${platform.sdk.time}&token=${token_temp}&sign=${platform.sdk.sign}&ext=${platform.sdk.ext}&r=1`;
			}
			return `channel=0&appId=0&userId=${userId}&time=0&token=&sign=&ext=&r=1`;
		}

		public logLoading(roleId: string, step: number, total: number = 0) {
			if (roleId == "" || roleId == undefined) return;
			var logStr: string = this.getLogLoadingURL() + "?roleId=" + roleId + "&step=" + step + "&total=" + total;
			new HttpRequest().request(logStr, null, null);
		}

		/**用户登录**/
		public async userLogin(roleId: string, caller?: any, method?: Function) {
			return new Promise((reslove, reject) => {
				this._account = roleId;
				(new HttpRequest()).request(this.getAuthURL() + "?" + this.getURLParam('login', platform.sdk ? platform.sdk.type : "", roleId), this, function (data: any) {
					this._authData = data;
					this._serverList = new ServerList(this._account.toString());
					if (method) method.call(caller, data);
					reslove(data);
				});
			})
		}

		/**发送微信进来**/
		public async requestWeiXin(inviteServerId,inviteAccount,myServerId,myAccount) {
			var str:string = `${'http'}://${(window as any).config.ip}/${(window as any).config.platform}/ShareFriendCommit.php?inviteServerId=${inviteServerId}&inviteAccount=${inviteAccount}&myServerId=${myServerId}&myAccount=${myAccount}`
			egret.log("微信分享==",str);
			(new HttpRequest()).request(str, this, function (data: any) {
				egret.log("微信分享回包");
			});
		}

		/**获取服务器列表**/
		public async requestServerList(roleId: string, caller?: any, method?: Function) {
			return new Promise((reslove, reject) => {
				(new HttpRequest()).request(`${(window as any).config.ssl ? 'https' : 'http'}://${(window as any).config.ip}/${(window as any).config.platform}/getServerInfo.php?roleId=${roleId}&platform_type=${platform.sdk ? platform.sdk.type : ""}&channel=${platform.sdk ? platform.sdk.channleId : ''}&r=${egret.getTimer()}`, this, function (data: any) {
					if (!(window as any).config.debug && !(window as any).config.superstart && data.newRole == 1) {
						this._serverList.selected = new ServerItem(data.serversList[0]);
						if (method) method.call(caller, true);
						reslove(true);
						return;
					}
					var items: ServerItem[] = [];
					for (var serverData of data.serversList) {
						items.push(new ServerItem(serverData));
					}
					items.sort(function (a, b) {
						return a.lastDate > b.lastDate ? -1 : 1;
					});
					var historyGroup: ServerGroup = new ServerGroup();
					historyGroup.name = '最近登录服';
					historyGroup.list = items;
					this._serverList.addGroup(historyGroup);

					var testCount: number = 0;
					if (data.total_test_count) {
						testCount = data.total_test_count;
					}

					var groups: ServerGroup[] = [];
					var n: number = Math.ceil(data.total_server_count / 50);
					for (var i: number = 0; i < n; i++) {
						var start: number = i * 50 + 1;
						var end: number = (i + 1) * 50;
						if (end > data.total_server_count) end = data.total_server_count;
						var name: string = "";
						if (testCount > 0) {
							if (testCount < end) {
								name = data.pre_normal_title + (start - testCount) + "-" + (end - testCount) + "服";
							} else {
								name = data.pre_test_title + start + "-" + end + "服";
							}
						} else {
							name = start + "-" + end + "服";
						}
						groups.push(new ServerGroup(start, end, name));
					}
					groups.reverse();
					if (groups.length) {
						groups[0].isLast = true;
					}
					for (var group of groups) {
						this._serverList.addGroup(group);
					}
					this._serverList.selected = historyGroup.list[0];
					this._isRequestServerList = true;
					if (method) method.call(caller, false);
					reslove(false);
				}, egret.URLRequestMethod.GET);
			})
		}

		/**是否请求过服务器列表 */
		public get isRequestServerList() {
			return this._isRequestServerList;
		}

		public get serverList(): ServerList {
			return this._serverList;
		}

		public get authData(): any {
			return this._authData;
		}

		public get account(): string {
			return this._account;
		}

		public destory() {
			this._authData = null;
			this._serverList.destory();
			this._serverList = null;
		}

		public reportSelectServer() {
			if (!platform.sdk) return;
			var dataType: number = platform.sdk.getDataType(platform.DATA_SELECT_SERVER);
			if (!dataType || !shell.LoginData.instance.serverList.selected) return;
			platform.sdk.submitExtraData(
				dataType,
				platform.sdk.appId,
				parseInt(shell.LoginData.instance.serverList.selected.sid),
				shell.LoginData.instance.serverList.selected.name,
				"",
				"",
				0,
				0,
				parseInt(((new Date()).getTime() / 1000).toFixed(0)), "", "", -1, -1, 0);
		}
	}

	export class HttpRequest extends egret.URLLoader {
		private _url: string;
		private _completeCaller: any;
		private _completeMethod: Function;
		constructor() {
			super();
		}

		public request(url: string, caller: any, method: Function, requestMethod: string = egret.URLRequestMethod.POST, data: any = null) {
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

	export class ServerList {
		private _acount: string;
		private _serverGroupList: ServerGroup[];
		private _cache: ServerItem;
		private _selected: ServerItem;
		private _selectedChangeCaller: any;
		private _selectedChangeMethod: Function;
		public constructor(acount: string) {
			this._acount = acount;
			this.readLocalServer();
		}
		private readLocalServer() {
			var historyCahce: string;
			try {
				historyCahce = egret.localStorage.getItem(this._acount + '_serverInfo');
			} catch (e) {
				historyCahce = "";
			}
			var historyData: any = historyCahce ? JSON.parse(historyCahce) : null;
			if (historyData) {
				this._cache = new ServerItem(historyData);
			}
		}

		public saveLocalServer() {
			try { egret.localStorage.setItem(this._acount + '_serverInfo', JSON.stringify(this._selected.data)) } catch (e) { };;
		}

		public get names(): string[] {
			var names: string[] = [];
			if (this._serverGroupList) {
				for (var group of this._serverGroupList) {
					names.push(group.name);
				}
			}
			return names;
		}

		public addGroup(group: ServerGroup) {
			if (!this._serverGroupList) this._serverGroupList = [];
			this._serverGroupList.push(group);
		}

		public getGroup(index): ServerGroup {
			if (this._serverGroupList) {
				if (index < this._serverGroupList.length) {
					return this._serverGroupList[index];
				}
			}
			return null;
		}

		public set selected(v: ServerItem) {
			if (this._selected != v) {
				this._selected = v;
				if (this._selectedChangeMethod) {
					this._selectedChangeMethod.call(this._selectedChangeCaller, this._selected);
				}
			}
		}

		public get selected(): ServerItem {
			return this._selected;
		}

		public get cache(): ServerItem {
			return this._cache;
		}


		public onSelectedChange(caller: any, method: Function) {
			this.offSelectedChange();
			this._selectedChangeCaller = caller;
			this._selectedChangeMethod = method;
		}

		public offSelectedChange() {
			this._selectedChangeMethod = this._selectedChangeCaller = null;
		}

		public destory() {
			this.offSelectedChange();
			this._selected = null;
			for (var group of this._serverGroupList) {
				group.destory();
			}
			this._serverGroupList.length = 0;
			this._serverGroupList = null;
		}

		public getLoginDataById(sid: string) {
			if (this._selected && this._selected.sid == sid) return this._selected;
			for (var group of this._serverGroupList) {
				if (!group.list) continue;
				for (var data of group.list) {
					if (data.sid == sid) {
						return data;
					}
				}
			}
			return null;
		}
	}
	export class ServerGroup {
		private _name: string;
		private _start: number;
		private _end: number;
		private _list: ServerItem[];
		private _isLast: boolean;
		public constructor(start: number = 0, end: number = 0, name: string = "") {
			if (name != "") {
				this._name = name;
			} else {
				this._name = start + "-" + end + "服";
			}
			this._start = start;
			this._end = end;
		}

		public requestList(caller: any, method: Function) {
			(new HttpRequest()).request(`${(window as any).config.ssl ? 'https' : 'http'}://${(window as any).config.ip}/${(window as any).config.platform}/getServerPage.php?start_index=${this._start}&end_index=${this._end}&roleId=${platform.sdk ? platform.sdk.roleId : shell.LoginData.instance.authData.identityId}&platform_type=${platform.sdk ? platform.sdk.type : ""}&channel=${platform.sdk ? platform.sdk.channleId : ''}&r=${egret.getTimer()}`, this, function (data: any) {
				this._list = [];
				for (var serverData of data) {
					var item: ServerItem = new ServerItem(serverData);
					this._list.push(item);
				}
				this._list.reverse();
				if (this._isLast && this._list.length) {
					this._list[0].isNew = true;
				}
				method.call(caller);
			}, egret.URLRequestMethod.GET);
		}

		public set isLast(v: boolean) {
			this._isLast = v;
		}

		public get isLast(): boolean {
			return this._isLast;
		}

		public set name(v: string) {
			this._name = v;
		}

		public get name(): string {
			return this._name;
		}

		public set list(value: ServerItem[]) {
			this._list = value;
		}

		public get list(): ServerItem[] {
			return this._list;
		}

		public getDataById(sid: string): ServerItem {
			for (var data of this._list) {
				if (data.sid == sid) {
					return data;
				}
			}
			return null;
		}

		public destory() {
			if (this._list) {
				this._list.length = 0;
				this._list = null;
			}
			this._name = null;
		}
	}
	export class ServerItem {
		/**关闭 */
		public static CLOSE: number = 0;
		/**开启 */
		public static OPEN: number = 1;
		/**维护中 */
		public static MAINTEN: number = 2;
		/**待开 */
		public static STAYOPEN: number = 3;
		private _openDate: Date;
		private _data: any;
		private _lastDate: Date;
		private _loginDays: number;
		private _isNew: boolean;
		public constructor(data: any) {
			this._data = data;
			this._openDate = new Date(data.openTime);
			if (data.lastLoginTime) this._lastDate = new Date(data.lastLoginTime);
			if (data.loginDays) this._loginDays = parseInt(data.loginDays);
			if ((window as any).config.superstart) {
				this._data.status = ServerItem.OPEN;
			}
		}
		/**服务器名称 */
		public get name(): string {
			return this._data.name;
		}
		/**开服日期 */
		public get openDate(): Date {
			return this._openDate;
		}
		public set isNew(v: boolean) {
			this._isNew = v;
		}
		public get isNew(): boolean {
			return this._isNew;
		}
		public get cdn_url(): string {
			return this._data.cdn_url;
		}
		public get http_port(): Date {
			return this._data.http_port;
		}
		public get sid(): string {
			return this._data.id;
		}
		public get ip(): string {
			return this._data.ip;
		}
		public get port(): string {
			return this._data.port;
		}
		public get status(): number {
			return this._data.status;
		}
		public get version(): string {
			return this._data.version;
		}
		/**最后一次登录的日期 */
		public get lastDate(): Date {
			return this._lastDate;
		}
		/**累计登录的天数 */
		public get loginDays(): number {
			return this._loginDays;
		}
		public get data(): any {
			return this._data;
		}
	}
}