module shell {

	export class LoginServerView extends LoginBaseView {
		public btnChange: eui.Button;
		public labSeverName: eui.Label;
		public bntEnter: eui.Button;
		public btnNotice: eui.Button;
		public labBanSu: eui.Label;
		//private egretFactory: dragonBones.EgretFactory = dragonBones.EgretFactory.factory;

		constructor() {
			super();
			this.skinName = `skin.LoginServerViewSkin`;
			this.initialize();
			//this.createArmature();
		}

		public destory(): void {
			this.labBanSu.text = "";
			RES.destroyRes('img_loding_jpg');
			RES.destroyRes('img_selet_sever_back_png');
			RES.destroyRes('btn_login_enter_png');
			RES.destroyRes('btn_gonggao_png');

			// dragonBones.WorldClock.clock.clear();
			// this.egretFactory.removeDragonBonesData("zhaoyun_ui", true);
			// RES.destroyRes("zhaoyun_ui_ske_json");
			// RES.destroyRes("zhaoyun_ui_tex_json");
			// RES.destroyRes("zhaoyun_ui_tex_png");

			super.destory();
		}

		// private createArmature(){
		// 	RES.getResAsync("zhaoyun_ui_ske_json",function(dragonbonesData){
		// 	    RES.getResAsync("zhaoyun_ui_tex_json",function(textureData){
		// 	        RES.getResAsync("zhaoyun_ui_tex_png",function(texture){
		// 				//往龙骨工厂里添加资源
		// 				this.egretFactory.parseDragonBonesData(dragonbonesData);
		// 				this.egretFactory.parseTextureAtlasData(textureData,texture);
		// 				var armature: dragonBones.Armature = this.egretFactory.buildArmature("Armature", "zhaoyun_ui");
		// 				var armatureDisplay = armature.getDisplay();
		// 				this.addChildAt(armatureDisplay, 1);
		// 				armatureDisplay.x = 380;
		// 				armatureDisplay.y = 950;
		// 				armature.animation.play("stand", 0);
		// 				dragonBones.WorldClock.clock.add(armature);
		// 	        },this);
		// 	    },this);
		// 	},this);
		// 	egret.Ticker.getInstance().register(  
		// 		function(frameTime:number){dragonBones.WorldClock.clock.advanceTime(0.01)},  
		// 		this
		// 	);
		// }

		protected initialize() {
			this.bntEnter.enabled = false;
			this.labBanSu.textAlign = "center";
			var notice: string = '抵制不良游戏，拒绝盗版游戏。注意自我保护，谨防受骗上当。\n适度游戏益脑，沉迷游戏伤身。合理安排时间，享受健康生活。';
			this.labBanSu.y = 1000;
			// if (platform.sdk && this.isBanshu(platform.sdk.type)) {
			// 	notice = '本应用由“杭州火娱网络有限公司”提供\n抵制不良游戏，拒绝盗版游戏。 注意自我保护，谨防受骗上当。\n适度游戏益脑，沉迷游戏伤身。 合理安排时间，享受健康生活。\n文网游备字[2016]M-RPG 2561号 出版物号 [ISBN]：978-7-7979-0207-6 \n新广出审[2016]1412号 出版单位：杭州群游科技有限公司 \n著作权人：安徽新媒互娱网络有限公司\n适龄提示：本游戏适合18周岁以上者参与';
			// 	this.labBanSu.y = 970;
			// } else if (platform.sdk && platform.sdk.type == platform.KY) {
			// 	notice = '抵制不良游戏，拒绝盗版游戏。 注意自我保护，谨防受骗上当。\n适度游戏益脑，沉迷游戏伤身。 合理安排时间，享受健康生活。\n沪网文[2016]M-RPG 7350号 出版物号 [ISBN]:978-7-498-00775-9 \n新广出审[2017]7740号 出版单位：北京畅元国讯科技有限公司\n著作权人：北京梦幻果冻科技有限公司\n适龄提示：本游戏适合18周岁以上者参与';
			// 	this.labBanSu.y = 970;
			// } else if (platform.sdk && (platform.sdk.type == platform.NN_H5||platform.sdk.type == platform.NN_IOS||platform.sdk.type == platform.NN_ANDROID||platform.sdk.type == platform.NN_ZF||platform.sdk.type == platform.NN_ZF_H5)) {
			// 	notice = '抵制不良游戏，拒绝盗版游戏。 注意自我保护，谨防受骗上当。\n适度游戏益脑，沉迷游戏伤身。 合理安排时间，享受健康生活。\n文网游备字[2016]M-RPG 2561号 出版物号 [ISBN]：978-7-7979-0207-6 \n新广出审[2016]1412号 出版单位：杭州群游科技有限公司 \n著作权人：安徽新媒互娱网络有限公司\n适龄提示：本游戏适合18周岁以上者参与';
			// 	this.labBanSu.y = 970;
			// }
			this.labBanSu.text = notice;
		}
		private isBanshu(type: string): boolean {
			switch (type) {
				case platform.KY:
				case platform.AWY:
				case platform.DJSHP:
				case platform.DJSHPS:
				case platform.FKYLC:
				case platform.WB:
					return true;
				default:
					return false;
			}
		}
		public enter() {
			this.btnNotice.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickNotice, this);
			this.bntEnter.addEventListener(egret.TouchEvent.TOUCH_TAP, this.clickHandler, this);
			this.btnChange.addEventListener(egret.TouchEvent.TOUCH_TAP, this.openChangeSeverView, this);
			this.labSeverName.addEventListener(egret.TouchEvent.TOUCH_TAP, this.openChangeSeverView, this);
			this.bntEnter.enabled = true;
			this.update();
			shell.LoginData.instance.serverList.onSelectedChange(this, this.update);
		}

		public exit() {
			this.bntEnter.enabled = false;
			this.btnNotice.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.clickNotice, this);
			this.bntEnter.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.clickHandler, this);
			this.btnChange.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.openChangeSeverView, this);
			this.labSeverName.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.openChangeSeverView, this);
		}

		private clickNotice(e: egret.Event) {
			viewManager.openView(shell.NoticeView);
		}

		private openChangeSeverView(e: egret.TouchEvent) {
			viewManager.openView(ServerListView);
		}

		private listCllickHandler(e: eui.ItemTapEvent): void {

		}

		private clickHandler(e: egret.TouchEvent): void {
			if (shell.LoginData.instance.serverList.selected.status == 2) {
				shell.tipManager.show("服务器维护中!	请稍后尝试...", 0xFF3300, 2000);
				return;
			}
			this.bntEnter.enabled = false;
			shell.LoginData.instance.serverList.saveLocalServer();
			if (platform.sdk && platform.sdk.shareServerId && platform.sdk.shareUserId) {
				egret.log("邀请者1111111111111111==", platform.sdk.shareServerId);
				egret.log("邀请者2222222222222222==", platform.sdk.roleId);
				egret.log("被邀请者1111111111111111==", shell.LoginData.instance.serverList.selected.sid);
				egret.log("被邀请者2222222222222222==", shell.LoginData.instance.authData.identityId);
				shell.LoginData.instance.requestWeiXin(platform.sdk.shareServerId, platform.sdk.roleId, shell.LoginData.instance.serverList.selected.sid, shell.LoginData.instance.authData.identityId);
			}
			
			//shell.LoginData.instance.requestWeiXin(3, 76574358, shell.LoginData.instance.serverList.selected.sid, shell.LoginData.instance.authData.identityId);
			viewManager.closeView(shell.LoginServerView);
		}

		private update(): void {
			var status: number = Number(shell.LoginData.instance.serverList.selected.status);
			switch (status) {
				case shell.ServerItem.MAINTEN:
					this.labSeverName.text = shell.LoginData.instance.serverList.selected.name + "(维护中)";
					break;
				case shell.ServerItem.STAYOPEN:
					this.labSeverName.text = shell.LoginData.instance.serverList.selected.name;
					break;
				case shell.ServerItem.CLOSE:
					this.labSeverName.text = shell.LoginData.instance.serverList.selected.name + "(已关闭)";
					break;
				default:
					this.labSeverName.text = shell.LoginData.instance.serverList.selected.name;
					break;
			}
			shell.LoginData.instance.reportSelectServer();
		}
	}
}