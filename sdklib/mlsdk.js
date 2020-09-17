var ua = window.navigator.userAgent.toLowerCase(),
    device = {
        android: false,
        ios: false,
        weixin: false,
    };
	device.name = 'web';
if (ua.search(/android/) >= 0) {
    device.android = true;
    device.name = 'android';
    device.version = parseFloat((ua.match('android ([0-9.]+)') || [])[1]);
}
if (ua.search(/iphone|ipod|ipad/) >= 0) {
    device.ios = true;
    device.name = 'ios';
    device.version = parseFloat(ua.match(/os (\d)/));
}
if (ua.search(/micromessenger/) >= 0) {
    device.weixin = true;
}
if (ua.search(/mlandroidapp/) >= 0) {
    device.android = true;
    device.name = 'androidapp';
}

/**
 * MLSdk的回调接口，可继承并重写，传入到sdk的具体函数
 * 或，定义一个具有如下两个函数的对象传入sdk的具体函数
 */
function Callback() {
    this.onSuccess = function(backData){}
    this.onFaild = function(errData){}
}

function ManLingSDK() {
    /**
    * 打开登录窗口
    */
    this.openLogin = function(Callback) { 
        var callbackId = this.buildAndBindCallbackId(Callback,"openLogin");
		if(device.weixin) {
			
		}else if(device.android || device.ios) {
			window.location.href = 'jscript://openLogin/'+callbackId;
		}
        //PhoneManLing.openLogin(callbackId);
		
    }
	
	/**
	* 执行登出操作
	*/
	this.logout = function(Callback) {
		var callbackId = this.buildAndBindCallbackId(Callback,"logout");
        if(device.android || device.ios) {
			window.location.href = 'jscript://logout/'+callbackId;
		}
	}
	
	/**
	 * 上报数据
	 */
	this.submitExtraData = function(
		dataType, 
		serverID, 
		serverName, 
		roleID, 
		roleName, 
		roleCTime, 
		roleLevel, 
		moneyNum,
		Callback)
	{
		var callbackId = this.buildAndBindCallbackId(Callback,"submitExtraData");
			if(device.android || device.ios) {
				window.location.href = 'jscript://submitExtraData/'+callbackId
					+'/'+dataType
					+'/'+serverID
					+'/'+serverName
					+'/'+roleID
					+'/'+roleName
					+'/'+roleCTime
					+'/'+roleLevel
					+'/'+moneyNum;
			}
	}
    /**
    * 打开充值窗口
    */
    this.openCharge = function(productId,
		productName,
        productDesc,
		price,
		buyNum,
		coinNum,
		serverID,
		serverName,
		roleID,
		roleName,
		roleLevel,
		vip,
		extension,
        Callback) {
            var callbackId = this.buildAndBindCallbackId(Callback,"openCharge");
			if(device.android || device.ios) {
				window.location.href = 'jscript://openCharge/'+callbackId
					+'/'+productId
					+'/'+productName
					+'/'+productDesc
					+'/'+price
					+'/'+buyNum
					+'/'+coinNum
					+'/'+serverID
					+'/'+serverName
					+'/'+roleID
					+'/'+roleName
					+'/'+roleLevel
					+'/'+vip
					+'/'+extension;
			}
            //PhoneManLing.openCharge(callbackId,productName,productId,orderId,productExtra,payMoney);
        }
    /**
    * 打开用户中心窗口
    */
    this.userCenter = function() {
        if(device.android || device.ios) {
			window.location.href = 'jscript://userCenter/'+callbackId;
		}
    }

    /**
     *  -------------------  以下属于私有函数，尽量避免外部调用 ---------------------
     */
    this.callbackList = {},
    this.nativeCallback = function(callbackId,statue,data){
        Callback = this.callbackList[callbackId];

        if(Callback){
            switch(statue){
                case "onSuccess":Callback.onSuccess(data); break;
                case "onFaild":Callback.onFaild(data); break;
            }
            this.callbackList[callbackId] = null;
            delete this.callbackList[callbackId];
        }
    }
	
    this.buildAndBindCallbackId = function(Callback,functionName){
        var date = new Date();

        var callbackId = md5(date.getTime() + functionName);
        this.callbackList[callbackId] = Callback;

        delete date;
        return callbackId;
    }

}

window.MLSdk = new ManLingSDK();
