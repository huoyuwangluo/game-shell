import * as fs from 'fs';
import * as path from 'path';
export class WxgamePlugin implements plugins.Command {

    constructor() {
    }
    async onFile(file: plugins.File) {
        //不发布resource资源
        if(file.base.indexOf('resource')>=0) return null;

        
        if (file.extname == '.js') {
            const filename = file.origin;
            if (
                filename == "libs/modules/promise/promise.js" || 
                filename == 'libs/modules/promise/promise.min.js') {
                return null;
            }
            if (
                filename == 'libs/modules/egret/egret.js' || 
                filename == 'libs/modules/egret/egret.min.js') {
                let content = file.contents.toString();
                content += `;window.egret = egret;`;
                content = content.replace(/definition = __global/, "definition = window");
                file.contents = new Buffer(content);
            }
            else {
                let content = file.contents.toString();
                content = "var egret = window.egret;" + content;
                if (
                    filename == "libs/modules/res/res.js" ||
                    filename == 'libs/modules/res/res.min.js' ||
                    filename == 'libs/modules/assetsmanager/assetsmanager.min.js' ||
                    filename == 'libs/modules/assetsmanager/assetsmanager.js'
                ) {
                    content += ";window.RES = RES;"
                }else if (
                    filename == "libs/modules/eui/eui.js" || 
                    filename == 'libs/modules/eui/eui.min.js') {
                    content += ";window.eui = eui;\n"
                }else if (
                    filename == 'libs/dragonBones/dragonBones.js' || 
                    filename == 'libs/dragonBones/dragonBones.min.js') {
                    content += ';window.dragonBones = dragonBones';
                }else if (
                    filename == 'libs/decoder/decoder.js' || 
                    filename == 'libs/decoder/decoder.min.js') {
                    content += ';window.decoder = decoder;';
                }else if (
                    filename == 'libs/particle/particle.js' || 
                    filename == 'libs/particle/particle.min.js') {
                    content += ';window.particle = particle;';
                }else if (
                    filename == 'libs/core/core.js' || 
                    filename == 'libs/core/core.min.js') {
                    content += ';window.game = game;';
                    content += 'window.utils = utils;';
                    content += 'window.mg = mg;';
                    content += 'window.n = n;';
                    content += 'window.logger = logger;';
                }else if (
                    filename == 'libs/protos/protos.js' || 
                    filename == 'libs/protos/protos.min.js') {
                    var unshiftString='';
                    unshiftString+="if(!!window.n){var n=window.n;}\n";
                    content=unshiftString+content;
                }else if (
                    filename == 'libs/finding/finding.js' || 
                    filename == 'libs/finding/finding.min.js') {
                    content += 'window.PF = PF;';
                }else if (filename == 'default.thm..js' || 
                        filename == 'default.thm.min.js'){
                    content=`
                    window.skins={};
                    window.item={};
                    window.dialog={};
                    window.renderer={};
                    window.normal={};
                    window.components={};
                    window.skin={};
                    window.itemIcon={};
                    window.base={};
                    window.component={};
                    window.legionWar={};
                    window.view={};
                    window.tipIcon={};`+content;
                }else if (
                    filename == 'main.js'||
                    filename == 'main.min.js') {
                    var unshiftString='';
                    unshiftString+="if(!!window.utils){var utils=window.utils;}\n";
                    unshiftString+="if(!!window.game){var game=window.game;}\n";
                    unshiftString+="if(!!window.mg){var mg=window.mg;}\n";
                    unshiftString+="if(!!window.n){var n=window.n;}\n";
                    unshiftString+="if(!!window.logger){var logger=window.logger;}\n";
                    unshiftString+="if(!!window.main){var main=window.main;}\n";
                    unshiftString+="if(!!window.item){var item=window.item;}\n";
                    unshiftString+="if(!!window.ui){var ui=window.ui;}\n";
                    unshiftString+="if(!!window.renderer){var renderer=window.renderer;}\n";
                    unshiftString+="if(!!window.base){var base=window.base;}\n";
                    unshiftString+="if(!!window.components){var components=window.components;}\n";
                    unshiftString+="if(!!window.legionWar){var legionWar=window.legionWar;}\n";
                    unshiftString+="if(!!window.view){var view=window.view;}\n";
                    unshiftString+="if(!!window.copy){var copy=window.copy;}\n";
                    content=unshiftString+content;
                    content += ";!window.game?window.game = {Main:game.Main}:window.game.Main=game.Main;\n";
                    content += "window.components = components;\n";
                    content += "window.templates = templates;\n";
                    content += "window.Templates = Templates;\n";
                    content += "window.main = main;\n";
                    content += "window.item = item;\n";
                    content += "window.ui = ui;\n";
                    content += "window.renderer = renderer;\n";
                    content += "window.base=base;\n";
                    content += "window.component=component;\n";
                    content += "window.legionWar=legionWar;\n";
                    content += "window.view=view;\n";
                    content += "window.copy=copy;\n";
                }
                file.contents = new Buffer(content);
            }
        }
        return file;
    }
    async onFinish(pluginContext: plugins.CommandContext) {
        //同步 index.html 配置到 game.js
        const gameJSPath = path.join(pluginContext.outputDir, "game.js");
        if(!fs.existsSync(gameJSPath)) {
            console.log(`${gameJSPath}不存在，请先使用 Launcher 发布微信小游戏`);
            return;
        }
        let gameJSContent = fs.readFileSync(gameJSPath, { encoding: "utf8" });

        const projectConfig = pluginContext.buildConfig.projectConfig;
        const optionStr =
            `entryClassName: ${projectConfig.entryClassName},\n\t\t` +
            `orientation: ${projectConfig.orientation},\n\t\t` +
            `frameRate: ${projectConfig.frameRate},\n\t\t` +
            `scaleMode: ${projectConfig.scaleMode},\n\t\t` +
            `contentWidth: ${projectConfig.contentWidth},\n\t\t` +
            `contentHeight: ${projectConfig.contentHeight},\n\t\t` +
            `showFPS: ${projectConfig.showFPS},\n\t\t` +
            `fpsStyles: ${projectConfig.fpsStyles},\n\t\t` +
            `showLog: ${projectConfig.showLog},\n\t\t` +
            `maxTouches: ${projectConfig.maxTouches},`;
        const reg = /\/\/----auto option start----[\s\S]*\/\/----auto option end----/;
        const replaceStr = '\/\/----auto option start----\n\t\t' + optionStr + '\n\t\t\/\/----auto option end----';
        gameJSContent = gameJSContent.replace(reg, replaceStr);
        fs.writeFileSync(gameJSPath, gameJSContent);

        //修改横竖屏
        let orientation;
        if (projectConfig.orientation == '"landscape"') {
            orientation = "landscape";
        }
        else {
            orientation = "portrait";
        }
        const gameJSONPath = path.join(pluginContext.outputDir, "game.json");
        let gameJSONContent = JSON.parse(fs.readFileSync(gameJSONPath, { encoding: "utf8" }));
        gameJSONContent.deviceOrientation = orientation;
        fs.writeFileSync(gameJSONPath, JSON.stringify(gameJSONContent, null, "\t"));
    }
}