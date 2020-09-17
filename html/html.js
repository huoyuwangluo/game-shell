var process = require('process');
var fs = require('fs');

var args = process.argv.concat();
args.shift();
args.shift();
var action = args.shift();
var version = args[0] ? args[0] : "";
switch (action) {
    case 'help':
        console.log('version:修改所有版本号（不包含shell，sit）')
        console.log('versionmain:只修改主版本号')
        console.log('versionsub:只修改除主版本号之外的版本号')
        console.log('versionassets:修改资源版本号')
        console.log('versionscript:修改代码版本号')
		console.log('versionconfig:修改配置版本号')
        console.log('notice:修改公告版本号')
        console.log('shell:修改壳版本号')
        break;
    //修改所有版本号（不包含shell，sit）
    case 'version':
        updateVersionOfType('version:', version);
        break;
    //只修改主版本号
    case 'versionmain':
        updateVersionOfType('version:', version);
        break;
    //只修改除主版本号之外的版本号
    case 'versionsub':
        updateVersionOfType('version_assets:', version);
        updateVersionOfType('version_assetscript:', version);
        break;
    //修改资源版本号
    case 'versionassets':
        updateVersionOfType('version_assets:', version);
        break;
    //修改代码版本号
    case 'versionscript':
        updateVersionOfType('version_assetscript:', version);
        break;
	//修改配置版本号
    case 'versionconfig':
        updateVersionOfType('version_config:', version);
        break;
    //修改公告版本号
    case 'notice':
        updateVersionOfType('version_notice:', version);
        break;
    //修改配置加载方式
    case 'config':
        updateVersionOfType('configloadtype:', version);
        break;
    //修改壳版本号
    case 'shell':
        updateShellVersion(args[0])
        break;
    case 'sit':
        updateSitVersion(args[0])
        break;
}

function updateVersionOfType(type, version) {
    console.log("修改" + type + "版本号:" + version);
    var htmlFiles = getAllHtmls();
    for (var htmlPath of htmlFiles) {
        var content = fs.readFileSync(htmlPath).toString();
        var replaceContent = '';
        var notes = '';
        var lines = content.split("\n");
        for (var line of lines) {
            if (line.indexOf(type) >= 0) {
                replaceContent = line;
                if (replaceContent.indexOf('//') >= 0) {
                    notes = replaceContent.substring(replaceContent.indexOf('//'), replaceContent.length);
                }
                break;
            }
        }
        if (replaceContent != "") {
            content = content.replace(replaceContent, "        " + type + "'" + version + "'," + notes);
            fs.writeFileSync(htmlPath, content);
            console.log("[" + htmlPath + "]" + type + "版本号修改为:" + version);
        }
    }
}
function updateShellVersion(version) {
    console.log('修改vershell版本号:' + version);
    var htmlFiles = getAllHtmls();
    for (var htmlPath of htmlFiles) {
        var content = fs.readFileSync(htmlPath).toString();
        var replaceContent = '';
        var notes = '';
        var lines = content.split("\n");
        for (var line of lines) {
            if (line.indexOf('vershell') >= 0) {
                replaceContent = line;
                if (replaceContent.indexOf('//') >= 0) {
                    notes = replaceContent.substring(replaceContent.indexOf('//'), replaceContent.length);
                }
                break;
            }
        }
        if (replaceContent != "") {
            content = content.replace(replaceContent, "        vershell:'" + version + "'," + notes);
            fs.writeFileSync(htmlPath, content);
            console.log("[" + htmlPath + "]vershell版本号修改为:" + version)
        }
    }
}

function updateSitVersion(version){
    var htmlFiles = getAllHtmls();
    for (var htmlPath of htmlFiles) {
        var content = fs.readFileSync(htmlPath).toString();
        var replaceContent = '';
        var lines = content.split("\n");
        for (var i=0;i<lines.length;i++) {
            var line=lines[i];
            if (line.indexOf('shell/sit.js') >= 0) {
                var start=line.indexOf('?')+1;
                var end=line.indexOf('\'',start);
                var oldVersion=line.substring(start,end);
                lines[i] = line.replace(oldVersion,version);
                break;
            }
        }
        fs.writeFileSync(htmlPath, lines.join('\n'));
        console.log("[" + htmlPath + "]sit版本号修改为:" + version);
    }
}

//获取HTML文件
function getAllHtmls() {
    var fileNames = fs.readdirSync('./');
    var results = [];
    for (var fileName of fileNames) {
        if (fs.statSync("./" + fileName).isDirectory()) {
            continue;
        }
        var extention = fileName.substring(fileName.lastIndexOf('.') + 1, fileName.length);
        if (extention == 'html') {
            results.push('./' + fileName)
        }
    }
    return results;
}