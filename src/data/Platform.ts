var wx = (window as any).wx;
var gameSDK= (window as any).gameSDK;

module platform {
    export var DATA_REGISTER = 'data_register';
    export var DATA_SELECT_SERVER = 'data_select_server';
    export var DATA_CREATE_ROLE = 'data_create_role';
    export var DATA_ENTER_GAME = 'data_enter_game';
    export var DATA_LEVEL_UP = 'data_level_up';
    export var DATA_QUIT_GAME = 'data_quit_game';
    export var DATA_PAY = 'data_pay';
    export var DATA_CHAT = 'data_chat';
    export var DATA_CREATE_ROLE_ENTER = 'data_create_role_enter';
    export var DATA_CREATE_ROLE_CLICK = 'data_create_role_click';

    export function getPhpPath(name: string): string {
        return `${(window as any).config.ssl ? 'https' : 'http'}://${(window as any).config.ip}/${(window as any).config.platform}/${name}.php`;
    }

    export function generateUUID() {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxxxxxxxxxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
        return uuid;
    }

    export function formatUrlParams(params: any): string {
        var result = '';
        for (var key in params) {
            result += key + '=' + params[key] + '&';
        }
        return result.substring(0, result.length - 1);
    }

    export class sdk {
        public static type = 'wx';
        public static appId = '1714';
        public static userId = '';
        public static roleId = '';
        public static token = '';
        public static sign = '';
        public static session_key = '';
        public static tokenPay = '';
        public static pf = '';
        public static giftid = 0;
        public static time = '';
        public static ext = '';
        public static channleId = 900001;
        public static userInfo = null;
        public static uiOffsetY = 0;
        public static shareServerId = ''; //分享链接进入的服务器Id
        public static shareUserId = ''; //分享链接进入的玩家Id
        public static shareType = 0; //分享链接进入的分享类型

        /**是否显示邀请 */
        public static sharebonus: boolean = true;
        /**是否显示关注公众号 */
        public static focusbonus: boolean;
        public static miniGameVIP: boolean;
        public static qua: any;
        public static via: String;
        public static wanbachannel: any;
        public static verifyResult: boolean;
        public static focus: boolean;
        public static wbQQbeijing: boolean;
        public static weiduanDownload: boolean;
        public static mapping: any[];
        public static isIOS: boolean;
        public static isPay: boolean;
        private static openid: string;
        public static get enabled() {
            return (window as any).config.sdkEnabled;
        }
        public static getMappingId(productId: string, price: number = 0) {
            var mappingName = '';
            if (!mappingName) return productId;
            for (var item of sdk.mapping) {
                if (item.id == productId) {
                    if (!item.isShouChong) return item[mappingName] ? item[mappingName] : productId;
                    for (var item1 of sdk.mapping) {
                        if (item1.isShouChong) {
                            var content = item1[mappingName];
                            if (content) {
                                var array = content.split(';');
                                for (var item2 of array) {
                                    var array2 = item2.split(':');
                                    if (parseFloat(array2[0]) == price) {
                                        return array2[1];
                                    }
                                }
                            }
                        }
                    }
                    break;
                }
            }
            return productId;
        }

        private static loadMapping(caller, method) {
            (new shell.HttpRequest()).request((window as any).config.resource_shell + '/shopsdk.json?' + (window as any).config.vershell, this, (data: any) => {
                sdk.mapping = data;
                method.call(caller);
            }, egret.URLRequestMethod.GET);
        }

        public static start(caller: any, method: Function) {
            sdk.isPay=(window as any).ispay;
            //sdk.uiOffsetY = 80;
            wx.getSystemInfo({
                success: function (res) {
                    sdk.isIOS = res.system.indexOf('iOS') >= 0;
                    var s = ((res.screenHeight / res.screenWidth) * 100 >> 0) / 100;
                    console.log('s:'+s);
                    //sdk.uiOffsetY = (s>1.77&&s<2.08)?50:0;
                    sdk.uiOffsetY = (s > 1.77) ? 48 : 0;
                    // var deviceName = (res.model as string).replace(/ /g, '_').toLocaleUpperCase();
                    // //alert('获取系统信息成功:'+JSON.stringify(res));
                    // for (var value of ['PAAM00', 'PAAT00', 'PACM00', 'PACT00', 'CPH1831', 'CPH1833', 'PBAM00', 'IPHONE_XR', 'IPHONE_XS_MAX', 'IPHONE_X', 'MI_8', 'VIVO_Y85A']) {
                    //     if (new RegExp(value, 'gi').test(deviceName)) {
                    //         sdk.uiOffsetY = 48;
                    //         break;
                    //     }
                    // }
                }
            });
            this.loadMapping(this, () => {
                sdk.login(caller, method);
            })
        }

        private static login(caller: any, method: Function) {
            gameSDK.entryGame(() => {
                console.log('进入游戏成功')
                // 获取登录信息
                console.log('获取登录后的 开始调用loginUserInfo，当前时间戳：', Date.parse(new Date().toString()));
                gameSDK.cpSDK.loginUserInfo((res) => {
                    console.log('调用loginUserInfo成功，当前时间戳：', Date.parse(new Date().toString()));
                    console.log('用户信息为：', res)
                    sdk.openid = res.openid;
                    sdk.userId = res.uid;
                    sdk.roleId = res.uid;
                    sdk.session_key = res.access_token;

                    console.log("启动参数：" + res.share_ext);
                    if(res.share_ext != null)
                    {
                        sdk.shareServerId = !res.share_ext.sid ? 0 : res.share_ext.sid; //分享链接进入的服务器Id
                        sdk.shareUserId = !res.share_ext.uid ? "" : res.share_ext.uid; //分享链接进入的玩家Id
                        sdk.shareType = !res.share_ext.shareType ? 0 : res.share_ext.shareType; //分享链接进入的分享类型
                    }

                    wx.request({
                        url: getPhpPath('verifyWXLogin'),
                        data: {
                            appid: sdk.appId,
                            uid: res.uid,
                            accessToken: res.access_token
                        },
                        complete(data) {
                            if (data.data.status == 1) {
                                console.log('verifyWXLogin验证通过');
                                //sdk.submitExtraData(sdk.getDataType(DATA_REGISTER), sdk.appId);
                                method.call(caller);                            
                            } else {
                                console.error(data.data.msg);
                            }
                            //console.log("verifyWXLogin结果",data);
                            //method.call(caller);
                        }
                    });
                })
            }, (error) => {
                console.log('sdk load login...', error);
            });
            /*console.log('开始调用 wx.login...');
            wx.login({
                success(res) {
                    if (res.code) {
                        wx.request({
                            url: getPhpPath('getWXSession'),
                            data: {
                                code: res.code
                            },
                            complete(data) {
                                // if (data.data.errcode == 0) {
                                    sdk.openid = data.data.openid;
                                    sdk.userId = sdk.roleId = data.data.openid;
                                    sdk.session_key = data.data.session_key;
                                    sdk.submitExtraData(sdk.getDataType(DATA_REGISTER), sdk.appId);
                                    wx.getSystemInfo({
                                        complete: (res) => {
                                            if (res) {
                                                //'wx' +platformtype + '_' + data.data.openid
                                                sdk.openid = data.data.openid;
                                                var platformtype = res.system.indexOf('iOS') >= 0 ? 2 : 1;
                                                sdk.userId = sdk.roleId = "wx" + platformtype + "_" + data.data.openid;
                                                try {
                                                    wx.setStorageSync('user_id', sdk.userId);
                                                    wx.setStorageSync('session_key', sdk.session_key);
                                                    wx.setStorageSync('openid', sdk.openid);
                                                } catch (e) {
                                                    console.error(e);
                                                }
                                                method.call(caller);
                                            }
                                        }
                                    });
                                // } else {
                                //     console.error(data.data.errmsg);
                                // }
                            }
                        });
                    } else {
                        console.log('登录失败！' + res.errMsg)
                    }
                },
                fail(res) {
                    console.log('接口调用失败!' + res);
                }
            });*/
        }


        public static openCharge(
            serverId, 				//玩家所在服务器的ID
            serverName, 				//玩家所在服务器的名称
            gameRoleId, 					//玩家角色ID
            gameRoleName, 				//玩家角色名称
            gameRoleLevel, 				//玩家角色等级
            gameRoleVip, 					//游戏中玩家的vip等级
            price, 					//充值金额(单位：分)
            diamonds, 				//玩家当前身上剩余的游戏币
            buyCount, 					//购买数量，一般都是1
            productId, 				//充值商品ID，游戏内的商品ID
            productName, 			//商品名称，比如100元宝，500钻石...
            productDesc, 			//商品描述，比如 充值100元宝，赠送20元宝
            extension, 				//会在支付成功后原样通知到你们回调地址上，长度尽量控制在100以内
            time						//请求时间戳，精确到秒即可
        ) {
            if (sdk.isIOS) {
                wx.showToast({
                    title: '支付暂未开放!',
                    icon: 'none'
                });
                return;
            }
            var platformProductId = sdk.getMappingId(productId, price);
            var payObject:{} = {
                uid: sdk.userId,
                zone_id: serverId,
                zone_name: serverName,
                role_id: gameRoleId,
                role_name: gameRoleName,
                role_level: gameRoleLevel,
                role_currency: diamonds,
                amt: price,
                game_fee: diamonds,
                item_id: platformProductId,
                item_name: productName,
                item_desc: productDesc,
                ext: extension
            };
            // 发起支付
            gameSDK.cpSDK.makePayment(payObject).then(res => {
                console.log('支付成功：', res);
                sdk.submitExtraData(sdk.getDataType(DATA_PAY), sdk.appId, null, null, null, null, null, null, null, null, null, null, null, null, price);
                alert('支付成功!');
            }).catch(error => {
                console.log('支付失败：', error);
                alert('支付失败!');
            })
            /*wx.request({
                url: getPhpPath('getPayToken'),
                complete(data) {
                    if (data.data.errcode == 0) {
                        sdk.tokenPay = data.access_token;
                        wx.request({
                            url: getPhpPath('createOrder'),
                            data: {
                                session_key: sdk.session_key,
                                access_token: data.data.access_token,
                                //deviceplatform: egret.Capabilities.os.toLocaleLowerCase(),
                                deviceplatform: "qq_m_qq-2001-android-2011",
                                sid: serverId,
                                openId: sdk.userId,
                                productId: platformProductId,
                                price: price * 10,
                                count: buyCount,
                                gameRoleId: gameRoleId,
                                app_remark: `${serverId}_${gameRoleId}_${gameRoleName}_${productId}_${productName}_${sdk.session_key}`//透传参数
                            },
                            complete(data) {
                                if (data.data.errcode == 0) {
                                    wx.requestMidasPayment({
                                        prepayId: data.data.prepayId,//预下单获取的预下单ID
                                        starCurrency: price * 10,//需要消耗的游戏币数量
                                        success() {
                                            // 支付成功
                                            console.log('支付成功!');
                                            sdk.submitExtraData(sdk.getDataType(DATA_PAY), sdk.appId, null, null, null, null, null, null, null, null, null, null, null, null, price);
                                            alert('支付成功!');
                                        },
                                        fail({ errMsg, errCode }) {
                                            console.log(errMsg, errCode);
                                            // alert(`调用requestMidasPayment失败:\n[errCode]${errCode}\n[errMsg]${errMsg}`);
                                            if (errCode == -2) {
                                                alert('支付取消!');
                                            } else if (errCode == -1 || errCode == -3 || errCode == -4) {
                                                alert('支付失败!');
                                            }
                                        }
                                    });
                                } else {
                                    alert('创建订单失败...' + data.data.errmsg);
                                    console.error(data.data.errmsg);
                                }
                            }
                        });
                    } else {
                        alert('获取payToken失败...' + data.data.errmsg);
                        console.error(data.data.errmsg);
                    }
                }
            });*/
        }
        
        public static submitExtraData(
            dataType,
            appid,			//游戏appid
            serverId?,
            serverName?,		//区服名
            gameRoleUid?,
            gameRoleName?,		//角色名
            gameRoleLevel?,		//角色等级
            diamonds?,		//角色元宝数
            time?,				//请求时间戳，精确到秒即可
            content?,		//聊天内容
            chattype?,		//聊天类型
            job?,		//职业
            gameRoleVipLevel?,		//游戏中玩家的vip等级
            zhuanshenLevel?,		//游戏中玩家的vip等级
            prize?
        ) {
            if ((window as any).config.debug) return;
            var reportObject:{} = {
                data_type: dataType,
                zone_id: "" + serverId,
                zone_name: "" + serverName,
                role_id: "" + gameRoleUid,
                role_name: "" + gameRoleName,
                role_level: "" + gameRoleLevel,
                role_currency: "" + diamonds
            };
            if(!serverId && shell.LoginData.instance.serverList.selected)
            {
                serverId = "" + shell.LoginData.instance.serverList.selected.sid;
            }
            if(!serverName && shell.LoginData.instance.serverList.selected)
            {
                serverName = "" + shell.LoginData.instance.serverList.selected.name;
            }
            console.log('submitExtraData::serverId=' + serverId);
            console.log('submitExtraData::serverName=' + serverName);
            gameSDK.cpSDK.dataReport(reportObject);
            /*
            var dataName: string = this.getDataName(dataType);
            var obj: any = wx.getLaunchOptionsSync();
            switch (dataName) {
                case DATA_REGISTER:
                    //console.log('开始上报注册...',`https://report.8zy.com/report/regaccount/${appid}/qqqgame/${sdk.openid}/${obj.scene}`);
                    wx.request({
                        url: `https://report.8zy.com/report/regaccount/${appid}/qqqgame/${sdk.openid}/${obj.scene}`,
                        complete(data) {
                            if (data.ret == 0) console.log("注册成功");
                            //else console.log(JSON.stringify(data));
                        }
                    });
                    break;
                case DATA_CREATE_ROLE:
                    console.log('开始上报创角...', egret.getTimer());
                    wx.request({
                        url: `https://report.8zy.com/report/regchar/${appid}/qqqgame/${sdk.openid}/${obj.scene}`,
                        complete(data) {
                            if (data.ret == 0) console.log("创角上报成功");
                        }
                    });
                    break;
                case DATA_ENTER_GAME:
                    wx.request({
                        url: `https://report.8zy.com/report/login/${appid}/qqqgame/${sdk.openid}/${obj.scene}`,
                        complete(data) {
                            if (data.ret == 0) console.log("进入游戏上报成功");
                        }
                    });
                    break;
                case DATA_PAY:
                    //console.log(`https://report.8zy.com/report/pay/${appid}/qqqgame/${sdk.openid}/${prize}/0/${obj.scene}`);
                    wx.request({
                        url: `https://report.8zy.com/report/pay/${appid}/qqqgame/${sdk.openid}/${prize}/0/${obj.scene}`,
                        complete(data) {
                            if (data.ret == 0) console.log("支付上报成功");
                        }
                    });
                    break;

            }*/
        };

        public static shareAppMessage(
            uid:string,
            sid:string,
            shareType:number
        ) {
            if ((window as any).config.debug) return;
            var serverId:string = !sid ? shell.LoginData.instance.serverList.selected.sid : sid;
            var extContent:string = "uid=" + uid + "&sid=" + serverId + "&shareType=" + shareType;
            var shareObject:{} = {
                ext:extContent
            };
            console.log('shareAppMessage::extContent=' + extContent);
            gameSDK.cpSDK.shareAppMessage(shareObject);
        }

        public static getDataType(type: string): number {
            switch (type) {
                case DATA_SELECT_SERVER: return 1;
                case DATA_CREATE_ROLE: return 2;
                case DATA_ENTER_GAME: return 3;
                case DATA_LEVEL_UP: return 4;
                case DATA_QUIT_GAME: return 5;
                case DATA_PAY: return 6;
                case DATA_CHAT: return 7;
                case DATA_REGISTER: return 8;

            }
            return 0;
        }

        public static getDataName(type: number): string {
            switch (type) {
                case 1: return DATA_SELECT_SERVER;
                case 2: return DATA_CREATE_ROLE;
                case 3: return DATA_ENTER_GAME;
                case 4: return DATA_LEVEL_UP;
                case 5: return DATA_QUIT_GAME;
                case 6: return DATA_PAY;
                case 7: return DATA_CHAT;
                case 8: return DATA_REGISTER;
            }
            return '';
        }

        public static verifyIdentity(caller, method) { };
        public static setupShare(caller: any, method: Function) { }
        public static showShare(caller: any, method: Function) {
            wx.shareAppMessage({ imageUrl: (window as any).config.resource_shell + '/resource/share.jpg' });
            if (method) method.call(caller);
        }
        public static showFocus(caller: any, method: Function) { }
        public static redPacketReport(reportData: any, ifComplete: boolean) { }
        public static onWebViewVisibleChange(caller: any, method: Function) { }
        public static getWebViewVisible(): boolean { return false }
        public static reportXLActivity(): void { }
    }
}