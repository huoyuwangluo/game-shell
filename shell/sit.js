try { window.console.log.apply(console, " %c %c %c \u2728 \u2728 \u2728 热血无双 \u2728 \u2728 \u2728  %c  %c \u2726 杭州火娱网络有限公司出品 \u2726 %c %c %c%c,background: #9C0013; padding:5px 0;,background: #9C0013; padding:5px 0;,color: #FFFFFF; background: #030307; padding:5px 0;,background: #9C0013; padding:5px 0;,color: #FFFFFF;background: #DB0028; padding:5px 0;,background: #9C0013; padding:5px 0;,color: #ff2424; background: #fff; padding:5px 0;,color: #ff2424; background: #fff; padding:5px 0;,color: #ff2424; background: #fff; padding:5px 0;".split(",")) } catch (a) { }
console.log("\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04\ud83d\ude04");
try {
    if (config.sdk == 'wb' || config.sdk == 'nn_zf' || config.sdk == 'nn_zf_h5') {
        (function () {
            const IPHONE_X = 'IPHONE_X';
            const IPHONE_XS_MAX = 'IPHONE_XS_MAX';
            const IPHONE_XR = 'IPHONE_XR';
            const MI_8 = 'MI_8';
            const VIVO_Y85A = 'VIVO_Y85A';
            const OPPO_R15_1 = 'PACT00';
            const OPPO_R15_2 = 'PAAM00';
            const OPPO_R15_3 = 'PAAT00';
            function getInfo() {
                var capabilities = {};
                var ua = navigator.userAgent.toLowerCase();
                capabilities["isMobile" + ""] = (ua.indexOf('mobile') != -1 || ua.indexOf('android') != -1);
                if (capabilities.isMobile) {
                    if (ua.indexOf("windows") < 0 && (ua.indexOf("iphone") != -1 || ua.indexOf("ipad") != -1 || ua.indexOf("ipod") != -1)) {
                        capabilities["os" + ""] = "iOS";
                    }
                    else if (ua.indexOf("android") != -1 && ua.indexOf("linux") != -1) {
                        capabilities["os" + ""] = "Android";
                    }
                    else if (ua.indexOf("windows") != -1) {
                        capabilities["os" + ""] = "Windows Phone";
                    }
                }
                else {
                    if (ua.indexOf("windows nt") != -1) {
                        capabilities["os" + ""] = "Windows PC";
                    }
                    else if (ua.indexOf("mac os") != -1) {
                        capabilities["os" + ""] = "Mac OS";
                    }
                }
                var language = (navigator.language || navigator["browserLanguage"]).toLowerCase();
                var strings = language.split("-");
                if (strings.length > 1) {
                    strings[1] = strings[1].toUpperCase();
                }
                capabilities["language" + ""] = strings.join("-");
                var deviceInfo = navigator.userAgent.substring(navigator.userAgent.indexOf('(') + 1, navigator.userAgent.indexOf(')')).toUpperCase();
                switch (capabilities["os"]) {
                    case "iOS":
                        if (window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 375 && window.screen.height === 812) {
                            capabilities["device"] = IPHONE_X;
                        } else if (window.devicePixelRatio && window.devicePixelRatio === 3 && window.screen.width === 414 && window.screen.height === 896) {
                            capabilities["device"] = IPHONE_XS_MAX;
                        } else if (window.devicePixelRatio && window.devicePixelRatio === 2 && window.screen.width === 414 && window.screen.height === 896) {
                            capabilities["device"] = IPHONE_XR;
                        } else {
                            capabilities["device"] = "unknow iphone";
                        }
                        break;
                    case "Android":
                        if (/MI 8/gi.test(deviceInfo)) {
                            capabilities["device"] = MI_8;
                        } else if (/VIVO Y85A/gi.test(deviceInfo)) {
                            capabilities["device"] = VIVO_Y85A;
                        } else if (/PACT00/gi.test(deviceInfo)) {
                            capabilities["device"] = OPPO_R15_1;
                        } else if (/PAAM00/gi.test(deviceInfo)) {
                            capabilities["device"] = OPPO_R15_2;
                        } else if (/PAAT00/gi.test(deviceInfo)) {
                            capabilities["device"] = OPPO_R15_3;
                        } else {
                            var str = deviceInfo.split(';')[2];
                            capabilities["device"] = str.substring(0, str.lastIndexOf(' ', str.indexOf('/')));
                        }
                        break;
                    case "Windows Phone":
                        capabilities["device"] = "unknow windowsPhone";
                        break;
                    case "Windows PC":
                        capabilities["device"] = "unknow PC";
                        break;
                    case "Mac OS":
                        capabilities["device"] = "Mac";
                        break;
                }
                return capabilities;
            };
            var capabilitie = getInfo();
            function hasLiuHai() {
                var device = capabilitie["device"];
                return device == IPHONE_X || device == IPHONE_XS_MAX || device == IPHONE_XR || device == VIVO_Y85A || device == OPPO_R15_1 || device == OPPO_R15_2 || device == OPPO_R15_3;
            }
            //统一刘海头设置为40px
            var deviceBangHeight = 40;
            if (hasLiuHai()) {
                var topbar = document.createElement('div');
                topbar.style = "margin: auto;height: 40px; width:100%;background-image: url('shell/topbar.jpg');";
                document.body.insertBefore(topbar, document.getElementById('main'));

                var scaleHeight = (1080 - deviceBangHeight) / 1080 * 100 - 1;
                var mainDiv = document.getElementById('main');
                console.log(mainDiv.getBoundingClientRect().width + ':' + mainDiv.getBoundingClientRect().height);
                mainDiv.style.height = scaleHeight + '%';
                mainDiv.style.top = (100 - scaleHeight) / 100 * screen.height + 'px';
                mainDiv['dataset']['contentHeight'] = (1080 - deviceBangHeight) + '';
                console.log(mainDiv.getBoundingClientRect().width + ':' + mainDiv.getBoundingClientRect().height);
            }
        })();
    }
} catch (e) { };

config.os = '';
var getWebParams = function () {
    var params = {};
    var name, value;
    var str = window.location.href;
    var num = str.indexOf("?")
    str = str.substr(num + 1); //stringvar.substr(start [, length ]		
    var arr = str.split("&");
    for (var i = 0; i < arr.length; i++) {
        num = arr[i].indexOf("=");
        if (num > 0) {
            name = arr[i].substring(0, num);
            value = arr[i].substr(num + 1);
            params[name] = value;
        }
    }
    return params;
}


var addLogo = function () {
    if (!!document.getElementById("logo")) {
        return;
    }
    var params = getWebParams();
    switch (config.sdk) {
        case 'tw': {
            if (!!params.logotype && params.logotype == -2) {
                config.logourl = decodeURIComponent(params.logo_url) + '?' + Math.random();
            } else {
                config.logourl = window.config.resource_shell + "/resource/logo/" + config.logo + ".png?" + Math.random();
            }
        }
            break;
        case 'ky': {
            if (!!params.logotype && params.logotype == 2) {
                config.logourl = decodeURIComponent(params.logo_url) + '?' + Math.random();
            } else {
                config.logourl = window.config.resource_shell + "/resource/logo/" + config.logo + ".png?" + Math.random();
            }
        }
            break;
        case 'ss': {
            var logoname = config.logo;
            switch (params.app_id) {
                case '100119':
                    logoname = 'logo_moyushenqu';
                    break;
                case '100105':
                    logoname = 'logo_xuelangbingyuan';
                    break;
            }
            config.logourl = window.config.resource_shell + "/resource/logo/" + logoname + ".png?" + Math.random();
        }
            break;
        default:
            config.logourl = window.config.resource_shell + "/resource/logo/" + config.logo + ".png?" + Math.random();
            break;
    }
    var logo = document.createElement('img');
    logo.id = 'logo';
    logo.async = false;
    if (config.sdk == "wb") {
        logo.src = window.config.resource_shell + "/resource/logo/" + config.logoBg + ".jpg?" + Math.random();
    } else {
        logo.src = config.logourl;
    }
    logo.style.position = "absolute";
    if (config.sdk == "wb") {
        logo.style.width = "600px";
        logo.style.height = "1080px";
    } else {
        logo.style.width = "300px";
        logo.style.height = "178px";
    }
    logo.style.top = "50%";
    logo.style.left = "50%";
    logo.style.transform = "translate(-50%,-50%)";
    document.querySelectorAll(".egret-player")[0].appendChild(logo);
}

var removeLogo = function () {
    var child = document.getElementById("logo");
    if (child) child.parentNode.removeChild(child);
}

var addBGround = function () {
    if (!!document.getElementById("imgBG") || config.sdk != "wb") {
        return;
    }
    var BGround = document.createElement('img');
    BGround.id = 'imgBG';
    BGround.async = false;
    if (config.sdk == "wb") {
        BGround.src = window.config.resource_shell + "/resource/logo/wb_bg.png?" + Math.random();
    }
    BGround.style.position = "absolute";
    if (config.sdk == "wb") {
        BGround.style.width = "1928px";
        BGround.style.height = "1080px";
    }
    BGround.style.top = "50%";
    BGround.style.left = "50%";
    BGround.style.transform = "translate(-50%,-50%)";
    document.querySelectorAll(".egret-player")[0].appendChild(BGround);
}

var removeBGround = function () {
    if (config.sdk != "wb") return;
    var child = document.getElementById("imgBG");
    if (child) child.parentNode.removeChild(child);
}

var loadSingleJs = function (src, callback) {
    var s = document.createElement('script');
    s.async = false;
    s.src = src;
    s.addEventListener('load', function () {
        s.parentNode.removeChild(s);
        s.removeEventListener('load', arguments.callee, false);
        callback();
    }, false);
    document.body.appendChild(s);
};


var loadJsList = function (list, callback) {
    var total = list.length;
    var loaded = 0;
    for (var i = 0; i < total; i++) {
        loadSingleJs(list[i] + '?' + config.version + config.version_script, function () {
            loaded++;
            if (loaded >= total) {
                callback();
            }
        });
    }
};

var loadScripts = function (caller, method) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', window.config.resource_shell + '/manifest.json?' + config.vershell, true);
    xhr.addEventListener("load", function () {
        xhr.removeEventListener('load', arguments.callee, false);
        var object = JSON.parse(xhr.response);
        var list = object.initial.concat(object.game);
        for (var key in list) {
            var url = list[key]
            list[key] = window.config.resource_shell + '/' + url + '?' + config.vershell;
        }
        loadJsList(list, function () {
            method.call(caller);
        });
    });

    xhr.send(null);
};

window.addEventListener('resize', function () {
  if (document.activeElement.tagName == 'INPUT' || document.activeElement.tagName == 'TEXTAREA') {
    // 判断当前active的元素是否为input/ textarea
    window.setTimeout(function () {
      document.activeElement.scrollIntoViewIfNeeded()
      // 原生方法，滚动至需要显示的位置
    }, 0)
  }
})

window.onload = function () {
    loadScripts(this, function () {
        //所有代码加载完毕,准备初始化EGRET上下文
        /**
         * {
         * "renderMode":, //Engine rendering mode, "canvas" or "webgl"
         * "audioType": 0 //Use the audio type, 0: default, 2: web audio, 3: audio
         * "antialias": //Whether the anti-aliasing is enabled in WebGL mode, true: on, false: off, defaults to false
         * "calculateCanvasScaleFactor": //a function return canvas scale factor
         * }
         **/
        //todo...需要根据不同手机设备设置声音类型
        var isIOS = egret.Capabilities.os == 'iOS' || egret.Capabilities.os == 'Mac OS';
        document.querySelectorAll(".egret-player")[0].setAttribute('data-entry-class', "Shell");
        egret.runEgret({
            renderMode: "webgl", audioType: 0, calculateCanvasScaleFactor: function (context) {
                var backingStore = context.backingStorePixelRatio ||
                    context.webkitBackingStorePixelRatio ||
                    context.mozBackingStorePixelRatio ||
                    context.msBackingStorePixelRatio ||
                    context.oBackingStorePixelRatio ||
                    context.backingStorePixelRatio || 1;
                return (window.devicePixelRatio || 1) / backingStore;
            }
        });
    });
}
addBGround();
addLogo();
