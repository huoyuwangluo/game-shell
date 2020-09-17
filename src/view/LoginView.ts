module shell {
    export class LoginView extends LoginBaseView {
        public textDisplay:eui.EditableText;
        public promptDisplay:eui.Label;
        public input:eui.TextInput;
        public btnLogin:eui.Button;

        constructor(){
	        super();
	        this.skinName = `skin.LoginViewSkin`;
			this.initialize();
        }

        public destory():void{
			RES.destroyRes('create_btn_red_up_png');
			RES.destroyRes('btn_red_png');
			super.destory();
		} 

        protected initialize() {
            this.btnLogin.addEventListener(egret.TouchEvent.TOUCH_TAP, this.cllickHandler, this);
        }

		public enter(id:string=undefined){
			try{
				this.input.text = id?id:egret.localStorage.getItem('username');
			}catch(e){
				this.input.text = '';
			}
			// if(!this.input.text){
			// 	var date:Date=new Date()
			// 	this.input.text ='t'+date.getMinutes()+""+date.getSeconds()+""+date.getMilliseconds();
			// }
			// this.cllickHandler(null);
		}

		public exit(){
			
		}

        private cllickHandler(e: egret.Event) {
            if (this.input.text) {
				try{platform.sdk['_roleId']=this.input.text;}catch(e){}
				egret.localStorage.setItem('username', this.input.text)
                shell.viewManager.closeView(shell.LoginView,this.input.text);
            }
        }
    }
}