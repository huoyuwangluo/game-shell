module shell {

	export class ServerListView extends LoginBaseView {
		public imgRed: eui.Image;
		public listSection: eui.List;
		public listSever: eui.List;
		private _lastTab: number;
		constructor() {
			super();
			this.skinName = `skin.ServerListViewSkin`;
			this.initialize();
		}

		public destory(): void {
			RES.destroyRes('create_btn_yellow_png');
			RES.destroyRes('img_login_hot_png');
			RES.destroyRes('img_login_lay_png');
			RES.destroyRes('img_login_new_png');

			RES.destroyRes('img_offlin_bg_png_png');
			RES.destroyRes('img_create_list_back_png');
			RES.destroyRes('create_btn_red_up_png');
			RES.destroyRes('create_btn_red_down_png');
			RES.destroyRes('closetip_png');
			super.destory();
		}

		protected initialize() {
			this._lastTab = 0;
			this.listSever.itemRenderer = SelectServerListCell;
		}

		public enter(data: any): void {
			if (shell.LoginData.instance.isRequestServerList) {
				this.enterHandler();
			} else {
				shell.LoginData.instance.requestServerList(platform.sdk ? platform.sdk.roleId : shell.LoginData.instance.authData.identityId, this, function (first: boolean) {
					this.enterHandler();
				});
			}
		}

		private enterHandler() {
			this.listSection.dataProvider = new eui.ArrayCollection(shell.LoginData.instance.serverList.names);
			this.listSection.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.listCllickHandler, this);
			this.listSever.addEventListener(eui.ItemTapEvent.ITEM_TAP, this.changServer, this);
			viewManager.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.tapStageHandler, this);
			this.selectedTab(0);
		}

		public exit() {
			this.listSection.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.listCllickHandler, this);
			this.listSever.removeEventListener(eui.ItemTapEvent.ITEM_TAP, this.changServer, this);
			viewManager.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.tapStageHandler, this);
		}

		private tapStageHandler(e: egret.TouchEvent) {
			if (this.hitTestPoint(e.stageX, e.stageY)) {
				return;
			}
			viewManager.closeView(shell.ServerListView);
		}

		private selectedTab(index: number): void {
			if (index > -1) {
				this.listSection.selectedIndex = index;
				var group: ServerGroup = shell.LoginData.instance.serverList.getGroup(index);
				if (group) {
					if (group.list) {
						this.listSever.dataProvider = new eui.ArrayCollection(group.list);
						return;
					}
					group.requestList(this, function () {
						this.listSever.dataProvider = new eui.ArrayCollection(group.list);
					})
				}
			}
		}

		private listCllickHandler(e: eui.ItemTapEvent) {
			//切换选区
			this.selectedTab(this.listSection.selectedIndex);
		}

		private changServer(e: eui.ItemTapEvent) {
			// var group: ServerGroup = shell.LoginData.instance.serverList.getGroup(0);
			// if (group && group.list && !(window as any).config.debug) {
			// 	var strSid: string[] = [];
			// 	for (var i = 0; i < group.list.length; i++) {
			// 		strSid.push(group.list[i].sid);
			// 	}
			// 	var data: ServerItem = this.listSever.selectedItem;
			// 	if (strSid.indexOf(data.sid) == -1 && parseInt(data.sid) < 4) {
			// 		shell.tipManager.show("服务器注册人数已满", 0xFF0000,2000);
			// 		return;
			// 	}
			// }

			if (!(window as any).config.debug) {
				var data: ServerItem = this.listSever.selectedItem;
				if (parseInt(data.sid) < 4) {
					shell.tipManager.show("当前服务器爆满，请选择其他服务器。", 0xFF0000, 2000);
					return;
				}
			}
			shell.LoginData.instance.serverList.selected = this.listSever.selectedItem;
			viewManager.closeView(shell.ServerListView);
		}
	}
}