module shell {

	 export class NoticeView extends LoginBaseView {
		public labContent:eui.Label;
        public btnClose:eui.Button;

        constructor(){
	        super();
	        this.skinName = `skin.NoticeViewSkin`;
			this.initialize();
        }
        
        protected initialize() {
			this.loadNotice(this,function(content:string){
                this.labContent.textFlow=TextFlowMaker.generateTextFlow(content);
            })
		}

        public destory():void{
            this.labContent.textFlow=null;
			RES.destroyRes('img_offlin_bg_png');
            RES.destroyRes('btn_red_png');
            super.destory();
		}

		public enter(data: any, tab: number): void {
			this.btnClose.addEventListener(egret.TouchEvent.TOUCH_END, this.onClose, this);
		}

        private loadNotice(caller,method){
            if(this.labContent.textFlow&&this.labContent.textFlow.length){
                return;
            }
            var xhr = new XMLHttpRequest();
            var version:string=(window as any).config.debug?"":shell.LoginData.instance.serverList.selected.version;
            xhr.open('GET', `${version}/resource/notice/${(platform.sdk ? platform.sdk.type : 'tw')}.txt?${(window as any).config.version_notice}`, true);
            xhr.addEventListener("load", function () {
                xhr.removeEventListener('load', (arguments.callee as any), false);
		    	method.call(caller,(xhr.response).toString());
            });
            xhr.send(null);
        }

		public exit() {
			this.btnClose.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClose, this);
		}

		private onClose(e: egret.TouchEvent): void {
			shell.viewManager.closeView(NoticeView);
		}
	}

	 /**
     * Created by Saco on 2015/10/26.
     */
    class TextFlowMaker {
        private static STYLE_COLOR: string = "C";
        private static STYLE_SIZE: string = "S";
        private static PROP_TEXT: string = "T";
        private static NEW_LINE: string = "N";
        private static STYLE_UNDERLINE: string = "U";
        private static STYLE_HREF: string = "H";

        public static _htmlParserinstance: egret.HtmlTextParser = new egret.HtmlTextParser();
        /**
         * "你好|S:18&C:0xffff00&T:带颜色字号|S:50&T:大号字体|C:0x0000ff&T:带色字体";
         * @param sourceText
         * @returns {Array}
         */
        public static generateTextFlow(sourceText: string): egret.ITextElement[] {
            var textArr = sourceText.split("|");
            var result = [];
            for (var i = 0, len = textArr.length; i < len; i++) {
                result.push(this.getSingleTextFlow(textArr[i]));
            }
            return result;
        }
        // %1$s成功锻造出了魔龙装备%2$s，离魔域王者又进了一步！|C:0x34e22c&U:&H:7007&T:我也要
        // this.labContent.textFlow = new Array<egret.ITextElement>({ text: "京东方卡萨丁发了多少" }, {
        // 				text: "这段文字有链接",
        // 				style: { textColor: 0x2B8C25, underline: true, "href": "event:text event triggered" }
        // 			});
        private static getSingleTextFlow(text: string): egret.ITextElement {
            var textArr = text.split("&");
            var tempArr;
            var textFlow: any = { "style": {} };
            for (var i = 0, len = textArr.length; i < len; i++) {
                tempArr = textArr[i].split(":");
                switch (tempArr[0]) {
                    case TextFlowMaker.PROP_TEXT:
                        textFlow.text = tempArr[1];
                        break;
                    case TextFlowMaker.STYLE_SIZE:
                        textFlow.style.size = parseInt(tempArr[1]);
                        break;
                    case TextFlowMaker.STYLE_COLOR:
                        textFlow.style.textColor = parseInt(tempArr[1]);
                        break;
                    case TextFlowMaker.NEW_LINE:
                        textFlow.text = "\n";
                        break;
                    case TextFlowMaker.STYLE_UNDERLINE:
                        textFlow.style.underline = true;
                        break;
                    case TextFlowMaker.STYLE_HREF:
                        textFlow.style.href = "event:" + tempArr[1];
                        break;
                    default:
                        textFlow.text = tempArr[0];
                        break;
                }
            }
            return textFlow;
        }

        public static htmlParser(htmlStr:string){
            return this._htmlParserinstance.parser(htmlStr);
        }
    }
}