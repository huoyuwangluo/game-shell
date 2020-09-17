module shell {

    export class LayerManager 
	{
        private  _root:egret.DisplayObjectContainer;
        private  _sdk:egret.DisplayObjectContainer;
		private _stage:egret.Stage;
		private static _instance:LayerManager;
		public static get instance():LayerManager{
			if(!LayerManager._instance){
				LayerManager._instance=new LayerManager();
			}
			return LayerManager._instance;
		}

        public initialize(stage:egret.Stage):void{
			this._stage=stage;
            this._root = new egret.DisplayObjectContainer();
			stage.addChild(this._root);
			this._sdk = new egret.DisplayObjectContainer();
			stage.addChild(this._sdk);
        }
		
        public get root():egret.DisplayObjectContainer{
            return this._root;
        }
		public get sdk():egret.DisplayObjectContainer{
            return this._sdk;
        }

		public get stage():egret.Stage{
            return this._stage;
        }
    }
	export let layerManager:LayerManager=new LayerManager();

	export class ViewManager{
		private _stage:egret.Stage;
		private _views:any;
		private _openList:shell.LoginBaseView[];
		private _back:egret.Shape;
		private _closeHandlers:any[];
		public initialize(stage:egret.Stage){
			this._stage=stage;
			this._back=new egret.Shape();
			this._back.touchEnabled=true;
			this._views={};
			this._openList=[];
		}

		public openView(viewClazz:any,...args){
			if(!this._views) return;
			var name:string=egret.getQualifiedClassName(viewClazz);
			if(!this._views[name]) this._views[name]=new viewClazz();
			var view:shell.LoginBaseView=this._views[name];
			if(this._openList.indexOf(view)>=0) return;
			if(this._openList.length>0){
				layerManager.root.addChild(this._back);
				this.reDrawBack();
			}
			layerManager.root.addChild(view);
			this._openList.push(view);
			view.enter.call(view,...args);
			this._stage.addEventListener(egret.Event.RESIZE,this.resizeHandler,this);
			this.resizeHandler(null);
		}

		public closeView(viewClazz:any,...args){
			var name:string=egret.getQualifiedClassName(viewClazz);
			if(this._views&&this._views[name]){
				var view:shell.LoginBaseView=this._views[name];
				var index:number=this._openList.indexOf(view);
				if(index>=0) this._openList.splice(index,1);
				view.exit();
				if(view.parent){
					view.parent.removeChild(view);
				}
				if(this._openList.length<=1){
					if(this._back.parent){
						this._back.parent.removeChild(this._back);
					}
				}
				if(!this._openList.length){
					this._stage.removeEventListener(egret.Event.RESIZE,this.resizeHandler,this);
				}
				if(this._closeHandlers&&this._closeHandlers.length){
					for(var i=0;i<this._closeHandlers.length;i++){
						var obj=this._closeHandlers[i];
						if(obj.name==name){
							obj.method.call(obj.caller,...args);
							this._closeHandlers.splice(i,1);
							return;
						}
					}
				}
			}
		}

		public getView(viewClazz:any){
			var name:string=egret.getQualifiedClassName(viewClazz);
			if(this._views&&this._views[name]){
				return this._views[name];
			}
			return null;
		}

		public onViewCloseOnce(viewClazz:any,caller,method){
			if(!this._closeHandlers){
				this._closeHandlers=[];
			}
			var name:string=egret.getQualifiedClassName(viewClazz);
			this._closeHandlers.push({name:name,caller:caller,method:method})
		}

		private reDrawBack(){
			this._back.graphics.clear();
			this._back.graphics.beginFill(0x0,0.8);
			this._back.graphics.drawRect(0,0,this._stage.stageWidth,this._stage.stageHeight);
		}

		private resizeHandler(e:egret.Event){
			for(var view of this._openList){
				view.x=this._stage.stageWidth/2-view.width/2;
				view.y=this._stage.stageHeight/2-view.height/2;
			}
			if(this._back.parent){
				this.reDrawBack();
			}
		}

		public destory(){
			this._openList.length=0;
			this._openList=null;
			for(var key in this._views){
				var view=this._views[key];
				if(view.parent){
					view.parent.removeChild(view);
				}
				view.destory();
			}
			if(this._back.parent){
				this._back.parent.removeChild(this._back);
			}
			this._stage.removeEventListener(egret.Event.RESIZE,this.resizeHandler,this);
			this._views=null;
		}

        public get stage():egret.Stage{
            return this._stage;
        }
	}

	export let viewManager:ViewManager=new ViewManager();

	export class TipManager extends eui.Component{
		private _stage:egret.Stage;
		private _back:egret.Shape;
		private _label:eui.Label;
		private _timeId:number;
		constructor(){
			super();
			this._back=new egret.Shape();
			this.addChild(this._back);

			this._label=new eui.Label();
			this._label.size=20;
			this.addChild(this._label);
		}
		// private static _instance: TipManager;
		// public static get instance(): TipManager {
		// 	if (!TipManager._instance) {
		// 		TipManager._instance = new TipManager();
		// 	}
		// 	return TipManager._instance;
		// }
		/**
		 * 加载基本资源配置
		 */
		public initialize(stage: egret.Stage): void {
			this._stage = stage;
		}

		public show(text:string,color:number,time:number=0,caller:any=null,method:Function=null){
			this._label.text=text;
			this._label.textColor=color;
			this._label.validateNow();
			this._label.x=this._label.y=10;

			this._back.graphics.clear();
			this._back.graphics.beginFill(0,0.8);
			this._back.graphics.drawRect(0,0,this._label.width+20,this._label.height+20);
			this._back.graphics.endFill();

			layerManager.root.addChild(this);
			this.x=this._stage.stageWidth/2-this._back.width/2;
			this.y=this._stage.stageHeight-300;
			
			if(this._timeId){
				egret.clearTimeout(this._timeId);
				this._timeId=0;
			}
			if(time){
				this.tweenIn();
				this._timeId=egret.setTimeout(function(){
					this.remove();
					if(method) method.call(caller);
				},this,time);
			}
		}

		private _targetY:number;
		private tweenIn(){
			this.alpha=0;
			this._targetY=this.y;
			this.y+=30;
			this._stage.addEventListener(egret.Event.ENTER_FRAME,this.renderHandler,this);
		}

		private renderHandler(e:egret.Event){
			this.y+=(this._targetY-this.y)/10;
			this.alpha+=(1-this.alpha)/10;
			if(Math.abs(this.y-this._targetY)<1){
				this._stage.removeEventListener(egret.Event.ENTER_FRAME,this.renderHandler,this);
				this.alpha=1;
				this.y=this._targetY;
			}
		}

		public remove(){
			if(this.parent){
				this.parent.removeChild(this);
			}
			this._stage.removeEventListener(egret.Event.ENTER_FRAME,this.renderHandler,this);
		}
	}

	export let tipManager:TipManager=new TipManager();
}
