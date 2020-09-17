module shell {
    export class LoginBaseView extends eui.Component{
		constructor(){
			super();
		}
		public enter(...args){}
		public exit(){}
		public destory(){
			this.skinName=null;
			super.removeChildren();
		}
	}
}