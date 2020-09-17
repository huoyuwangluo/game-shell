module shell {

    export class SelectServerListCell extends eui.ItemRenderer {

        public btnStatus:eui.Image;
        public labelName:eui.Label;
		public imgState:eui.Image;
		public imgLay:eui.Image;
		private grayFilters = [new egret.ColorMatrixFilter([0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0.3, 0.6, 0, 0, 0, 0, 0, 0, 1, 0])];
        constructor(){
	        super();
	        this.skinName = `skin.SelectServerListCellSkin`;
        }

        public getReferenceTexture():string[]{
			return [];
		}
		
		protected dataChanged() {
			//super.dataChanged();
			if (this.data) {
				var serverData:shell.ServerItem=this.data;
				this.visible = true;
				var status:number=Number(serverData.status);
				switch(status){
					case shell.ServerItem.MAINTEN:
					this.imgLay.source="img_login_lay_png";
					this.btnStatus.filters = this.grayFilters;
					this.labelName.text = "" + serverData.name + "(维护中)";
					break
					case shell.ServerItem.STAYOPEN:
					this.imgLay.source="img_login_stayopen_png";
					this.btnStatus.filters = this.grayFilters;
					this.labelName.text = "" + serverData.name;
					break;
					case shell.ServerItem.CLOSE:
					this.imgLay.source=null;
					this.btnStatus.filters = this.grayFilters;
					this.labelName.text = "" + serverData.name + "(已关闭)";
					break;
					default:
					this.imgLay.source=null;
					this.btnStatus.filters = null;
					this.labelName.text = "" + serverData.name;
					break;
				}
				this.imgState.source=serverData.isNew?"img_login_new_png":"img_login_hot_png";
			} else {
				this.visible = false;
			}
		}
	}
}