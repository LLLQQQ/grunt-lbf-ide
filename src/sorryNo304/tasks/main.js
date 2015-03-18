/**
 *
 * @author patrickliu
 * @date 1/6/15
 */

var fs = require('fs'),
    walk = require('./../../utils/traverseDir'),
    grep = require('./../../deps/grep'),
    jsBeautify = require('js-beautify').js_beautify,
    md5 = require('./../../utils/md5'),
    get16MD5 = md5.get16MD5,
    path = require('path');

// write the jsonString to the localsJsonPath
function writeToLocalsJson(localsJsonPath, jsonString) {
    try {
        // set值之后，我们再次写回去
        fs.writeFileSync(localsJsonPath, jsBeautify(JSON.stringify(jsonString)));

    } catch(e) {
        console.log('error = ' + e.name);
    }
}

// get the html path namespace
function getHtmlNS(root, htmlPath) {
    // 统一替换成
    var replaceSep = new RegExp();
    if(path.sep == '\\') {
        replaceSep = new RegExp('\\\\', 'g');
    } else {
        replaceSep = new RegExp('\/', 'g');
    }
    //保证生成的是/a/b/c 而不是\\a\\b\\c
    return htmlPath.replace(root, '').replace(replaceSep, '/');
}

module.exports = exports = function(grunt) {

    grunt.registerTask('generateDeps', 'generate the deps of the js files in the src dir', function() {

        // get data from release.generateDeps
        var options = grunt.config.get('no304_release')['options']['no304_generateDeps']['options'],
        // src root path
            src = options.src,
            exportFilePath = options.exportFilePath;

        var JS_REG = /\.js$/;

        var deps = {};

        walk(src, function(path){
            if(!JS_REG.test(path)){
                return;
            }

            var file = fs.readFileSync(path, { encoding: 'utf-8'});
            if(!file){
                return;
            }

            var ret = grep(file);
            if(ret){
                deps[ret.path] = ret.deps;
            }
        });

        if(exportFilePath){

            // write the temporary file to the exportFilePath
            writeToLocalsJson(exportFilePath, deps);
        } else {
            console.log(deps);
        }
    });

    grunt.registerTask('outputAliasDeps', 'out put alias and deps to localsjson', function() {
        grunt.log.warn('如果你发现这个任务一直在loading. 那极有可能发生了冲突。ctrl+c中止这个任务。手动去src目录下更新一下吧。');
        // 1. 生成js file
        // 2. 在localsJson写入
        var options = grunt.config.get('no304_release')['options']['no304_outputAliasDeps']['options'],
        // get the options value
            src = options.src,
        // 依赖的文件deps
            depsFilePath = options.depsFilePath,
            hengineRoot = options.hengineRoot,
            staticPrefix = options.staticPrefix,
            localsJsonPath = options.localsJson;

        // read the moduleDeps
        var moduleDeps = fs.readFileSync(depsFilePath, {"encoding": "utf-8"});

        try {
            moduleDeps = JSON.parse(moduleDeps);
        } catch(e) {
            grunt.fail.warn('need deps first, run: grunt generateDeps first.');
        }

        var aliasObj = {};

        var depsObj = {};

        // 对hengineRoot下的文件进行处理
        walk(hengineRoot, function(crtPath) {

            var ignoreExtName = ['.svn-base', '.svn'],
                isIgnore = false,
                splitArr = crtPath.split(path.sep);

            ignoreExtName.forEach(function(item) {

                splitArr.forEach(function(item1) {
                    if(item == item1) {
                        isIgnore = true;
                        return false;
                    }
                });

                if(isIgnore) {
                    return false;
                }
            });

            // if isIgnore = true
            // return it
            if(isIgnore) {
                return;
            }

            // parse the html file
            var retHtml = fs.readFileSync(crtPath, 'utf-8'),
                htmlNS = getHtmlNS(hengineRoot, crtPath);


            var HTML_USE_REGEXP = /LBF\.use\s*\(\s*\[((\s*['"][^'"]+['"]\s*,?)+)\]/g,
                tmpRetHtml = retHtml,
                matches = [];

            tmpRetHtml.replace(HTML_USE_REGEXP, function(m, m1) {
                m1 && matches.push(m1);
            });

            // if match
            if(matches.length > 0) {

                var curDeps = {};
                matches.forEach(function(match) {

                    // by regexp we get the deps of use modules
                    // such as LBF.use(['a.b.c', 'c.e.f'], function... -> we get ['a.b.c', 'c.e.f'] out
                    var useDeps = match.replace(/(['"\s])/g, ''),
                        useDepsArr = useDeps.split(',');


                    var parseDeps = useDepsArr,
                        isInParseDeps = {};

                    // traverse useDepsArr and mark the key in it as true in isInParseDeps
                    useDepsArr.forEach(function(item) {
                        isInParseDeps[item] = true;
                    });

                    for(var i = 0; i < useDepsArr.length; i++) {
                        var deps = useDepsArr[i],
                            getModuleDeps = moduleDeps[deps];

                        if(getModuleDeps) {
                            getModuleDeps.forEach(function(item) {
                                // if item is not in isInParseDeps
                                // which means this is not processed
                                if(!isInParseDeps[item]) {
                                    isInParseDeps[item] = true;
                                    useDepsArr.push(item);
                                }
                            });
                        }
                    }

                    // convert isInParseDeps to array
                    useDepsArr = [];
                    for(var i in isInParseDeps) {
                        useDepsArr.push(i);
                    }

                    // calculate the hash value of files in parseDeps
                    // src is the root of the files in parseDeps
                    // convert the deps to absolute path
                    // staticPrefix.a.c -> root/a/c.js
                    for(var i = parseDeps.length - 1; i >= 0; i--) {
                        var tmpDeps = parseDeps[i],
                            tmpDepsArr = tmpDeps.split('.'),
                            startWithPrefix = false;

                        // we only deal with the parseDeps starts with staticPrefix
                        for(var j = 0, len = staticPrefix.length; j < len; j++) {
                            var prefix = staticPrefix[j];
                            if (tmpDepsArr[0] === prefix) {
                                startWithPrefix = true;
                            }
                        }
                        if(startWithPrefix) {

                            tmpDepsArr.shift();
                            // if starts with prefix, generate the absolute path for further reading
                            parseDeps[i] = {
                                path: src + '/' + tmpDepsArr.join('/') + '.js',
                                ns: parseDeps[i]
                            };

                        } else {
                            // remove this item
                            parseDeps.splice(i, 1);
                        }
                    }

                    var curAlias = {};
                    // finally we get the used files of parseDeps in the matched html
                    // then we read the files in parseDeps and calculate the hash value
                    for(var i = 0, len = parseDeps.length; i < len; i++) {
                        var fsContent = fs.readFileSync(parseDeps[i].path);
                        curAlias[parseDeps[i].ns] = parseDeps[i].ns.replace(/\./g, '\/') + '-' + get16MD5(fsContent) + '.js';
                    }

                    aliasObj[htmlNS] = curAlias;


                    // 根据alias生成htmlNs的deps
                    for(var alias in curAlias) {
                        curDeps[alias] = moduleDeps[alias];
                    }
                });

                depsObj[htmlNS] = curDeps;
            }
        });


        writeToLocalsJson();

        // 将alias和deps写入localsJson文件
        function writeToLocalsJson() {
            try {
                var readLocalsJson = JSON.parse(fs.readFileSync(localsJsonPath));
                for(var i in readLocalsJson) {
                    var value1 = readLocalsJson[i];
                    if(i === 'common') {
                        value1['lbfAlias'] = aliasObj;
                        value1['lbfDeps'] = depsObj;
                    }
                }
                fs.writeFileSync(localsJsonPath, jsBeautify(JSON.stringify(readLocalsJson)));

            } catch(e) {
                grunt.log.warn('write to locals json error' + e.name + ' ' + e.message);
            }
        }
    });

    // 这个_release是给watch使用的，请不要主动使用她
    grunt.registerTask('_no304_release', 'generating version control..', function() {

        grunt.task.run(['generateDeps', 'outputAliasDeps', 'clean:no304_clean_deleteReleaseFiles', 'copy:no304_copy_releaseDir', 'copy:no304_copy_srcToRelease']);
    });

    // 这个release, 用于生成deps, 以及生成alias并写入locals.json里面。并将js文件加上后缀然后复制到release文件夹当中
    grunt.registerMultiTask('no304_release', 'generating version control..', function() {

        grunt.task.run(['generateDeps', 'outputAliasDeps', 'clean:no304_clean_release', 'copy:no304_copy_releaseDir', 'copy:no304_copy_srcToRelease']);
    });


    // 对单独的文件进行处理
    grunt.event.on('watch', function(action, filepath, target) {
        // argument example: [ 'changed|added|changed', 'src/conf/commonInit.js', 'scripts' ]
        // 仅针对target = scripts的进行处理
        if(target === 'scripts') {
            var filePathArr = filepath.split(path.sep);
            filePathArr.shift();

            // 获取dist根目录name
            var dist = grunt.config.get('clean')['no304_clean_deleteReleaseFiles']['src'];
            filePathArr.unshift(dist);

            var releasePathName = filePathArr.join(path.sep),
                needDeleteFileArr = [],
                fileFullName = filePathArr.pop(),
                fileName = fileFullName.split('.')[0],
                extName = fileFullName.split('.')[1],
                regexp = new RegExp('^' + fileName + '-'),
                deleteOriginalRegexp = new RegExp('^' + fileFullName + '$');

            // 遍历 release目录
            var releasePathDirName =  path.dirname(releasePathName);
            fs.readdirSync(releasePathDirName).forEach(function(item){
                var path = releasePathDirName + '/' + item;
                console.log('item' + item + ' ' + fileName);
                if(!fs.statSync(path).isDirectory()){
                    if(regexp.test(item)) {
                        needDeleteFileArr.push(path);
                    }
                    // 如果是“deleted"， 则删除原文件
                    if (action === 'deleted' && deleteOriginalRegexp.test(item)) {
                        needDeleteFileArr.push(path);
                    }
                }
            });

            // 动态设置此值
            grunt.config('clean.no304_clean_deleteRelease.src', needDeleteFileArr);

            // 跑起来
            grunt.task.run('_release');
        }
    });
};

