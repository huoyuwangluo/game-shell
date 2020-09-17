

var outFolderName = process.argv[2];
var fs = require('fs');

class Utils {

    static getFolderFiles(path) {
        if (!fs.existsSync(path)) return [];
        var results = [];
        var files = fs.readdirSync(path);
        for (var name of files) {
            var curPath = path + '/' + name;
            if (fs.statSync(curPath).isDirectory()) {
                results = results.concat(Utils.getFolderFiles(curPath + '/'));
            } else {
                results.push(curPath);
            }
        }
        return results;
    }

    static createFolder(path) {
        if (!path) return;
        path = path.replace(/\\/, '/');
        path = path.replace(/\/\//, '/');
        if (path.indexOf(':')) {
            path = path.substring(path.indexOf(':') + 1, path.ClearPlugin);
        }
        var paths = path.split('/');
        while (true) {
            if (!paths[0]) {
                paths.shift();
                continue;
            }
            break;
        }
        var fullP = '';
        for (var p of paths) {
            fullP += p + '/';
            if (!fs.existsSync(fullP)) {
                //console.log('create:',fullP);
                fs.mkdirSync(fullP);
            }
        }
    }

    static copyFolder(fromPath, toPath) {
        if (!fs.existsSync(fromPath)) return;
        if (!fs.existsSync(toPath)) {
            fs.mkdirSync(toPath);
        }
        var fromFiles = Utils.getFolderFiles(fromPath);
        var toFiles = [];
        fromFiles.map(function (filePath) {
            toFiles.push(filePath.replace(fromPath, toPath));
        });
        for (var i = 0; i < fromFiles.length; i++) {
            var fromPath = fromFiles[i].replace(/\\/, '/').replace(/\/\//, '/').replace(/\/\//, '/');
            var toPath = toFiles[i].replace(/\\/, '/').replace(/\/\//, '/').replace(/\/\//, '/');
            var folderPath = toPath.substring(0, toPath.lastIndexOf('/'));
            if (!fs.existsSync(folderPath)) {
                Utils.createFolder(folderPath);
            }
            //console.log('write:',fromPath,toPath);
            fs.writeFileSync(toPath, fs.readFileSync(fromPath));
        }
    }

    static copyFile(fromPath, toPath, appendContent) {
        fromPath = fromPath.replace(/\\/, '/').replace(/\/\//, '/').replace(/\/\//, '/');
        toPath = toPath.replace(/\\/, '/').replace(/\/\//, '/').replace(/\/\//, '/');
        if (!fs.existsSync(fromPath)) return;
        if (!fs.existsSync(toPath)) {
            Utils.createFolder(toPath);
        }
        if (appendContent) {
            var content = fs.readFileSync(fromPath).toString();
            fs.writeFileSync(toPath, content + appendContent);
        } else {
            fs.writeFileSync(toPath, fs.readFileSync(fromPath));
        }
    }

    static removeFolder(path) {
        if (!fs.existsSync(path)) return;
        if (!fs.statSync(path).isDirectory()) {
            fs.unlinkSync(path);
            return;
        }
        var files = fs.readdirSync(path);
        for (var name of files) {
            var curPath = path + '/' + name;
            if (fs.statSync(curPath).isDirectory()) {
                Utils.removeFolder(curPath + '/');
            } else {
                //console.log("unlink", curPath)
                fs.unlinkSync(curPath);
            }
        }
        fs.rmdirSync(path);
    }

    static async runCmd(cmd, method) {
        return new Promise((relove, reject) => {
            var childProcess = require('child_process');
            //var iconv = require('iconv-lite');
            var handler = childProcess.exec(cmd, {
                encoding: 'buffer',
                timeout: 0, /*子进程最长执行时间 */
                maxBuffer: 1024 * 1024
            });
            function stdotHandler(data) {
                //console.log(iconv.decode(data,'gbk'));
                console.log(data.toString());
            }
            function stderrHandler(data) {
                //console.log(iconv.decode(data,'gbk'));	
                console.log(data.toString());
            }
            function exitHandler(code) {
                handler.stdout.removeListener('data', stdotHandler);
                handler.stderr.removeListener('data', stderrHandler);
                handler.removeListener('exit', exitHandler);
                if (code == 0) {
                    relove();
                    if (method) method();
                } else {
                    reject();
                }
            }
            handler.stdout.on('data', stdotHandler);
            handler.stderr.on('data', stderrHandler);
            handler.on('exit', exitHandler);
        });
    }
}


class ClearPlugin {
    constructor() {
        var path, folders;
        path = './release/';
        folders = fs.readdirSync(path);
        for (var folderName of folders) {
            Utils.removeFolder(path + folderName);
        }
        path = './bin-release/web/';
        if (!fs.existsSync(path)) return;
        folders = fs.readdirSync(path);
        for (var folderName of folders) {
            Utils.removeFolder(path + folderName);
        }
    }
}

class PublishPlugin {
    constructor(complete) {
        Utils.runCmd('egret publish', complete)
    }
}

class MergePlugin {
    constructor() {
        var releasePath = './release/';
        if (!fs.existsSync(releasePath)) {
            fs.mkdirSync(releasePath);
        }
        Utils.copyFolder('./template_shell', './release');

        var bin = './bin-release/web/';
        var binPath = bin + fs.readdirSync(bin)[0];
        //console.log(binPath);
        Utils.copyFolder(binPath, './release');
    }
}

class FormatPlugin {
    constructor() {
        var releasePath = './release/';
        if (fs.existsSync(releasePath + 'index.html')) {
            fs.unlinkSync(releasePath + 'index.html');
        }
    }
}

class SyncPlugin {
    constructor() {
        var clientPath = `../${outFolderName}/shell/`;
        var folders = fs.readdirSync(clientPath);
        for (var folderName of folders) {
            Utils.removeFolder(clientPath + folderName);
        }
        console.log('release版本正在输出到：' + clientPath);
        Utils.copyFolder('./release', clientPath);
        console.log('sdk正在输出到：' + `../${outFolderName}/libs/sdk`);
        Utils.copyFolder('./libs/sdk', `../${outFolderName}/libs/sdk`);

        console.log('小程序版本正在输出到：' + `../${outFolderName}_wxgame/shell.min.js`);
        var content = fs.readFileSync('./release/js/default.thm.js').toString() + '\n' + fs.readFileSync('./release/js/main.js').toString() + ';window.skins = skins;window.shell = shell;window.platform = platform;';
        fs.writeFileSync(`../${outFolderName}_wxgame/shell.min.js`, content);
        var child_process1 = require('child_process');
        child_process1.execSync(`uglifyjs  ../${outFolderName}_wxgame/shell.min.js -o ../${outFolderName}_wxgame/shell.thm.min.js`);
        console.log('正在优化...');
        fs.unlinkSync(`../${outFolderName}_wxgame/shell.min.js`);
    }
}

var publish = async function () {
    new ClearPlugin();
    new PublishPlugin(() => {
        new MergePlugin();
        new FormatPlugin();
        new SyncPlugin();
    });
}
console.log('正在发布游戏壳...如果sdk有变化请先运行buildsdk命令...')
publish();
