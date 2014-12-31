/**
 * Created by patrickliu on 11/5/14.
 * this is a version control task.
 * getting the current version and generating the a.{$version}.js file
 *
 */
var fs = require('fs'),
    md5 = require('../../utils/md5'),
    get16MD5 = md5.get16MD5,
    exec = require('child_process').exec,
    path = require('path'),
    walk = require('../../utils/traverseDir'),
    jsBeautify = require('js-beautify').js_beautify;


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
    grunt.registerTask('sorryNo304', 'A deliminating 304 solution.', function() {
        grunt.log.warn('如果你发现这个任务一直在loading. 那极有可能发生了冲突。ctrl+c中止这个任务。手动去src目录下更新一下吧。');
        // 1. 生成js file
        // 2. 在localsJson写入
        var _grunt = this,
            options = this.options(),
            // get the options value
            root = options.root,
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
            var retHtml = fs.readFileSync(crtPath),
                htmlNS = getHtmlNS(hengineRoot, crtPath);


            var HTML_USE_REGEXP = /LBF\.use\s*\(\s*\[((\s*['"][^'"]+['"]\s*,?)+)\]/,
                matches = HTML_USE_REGEXP.exec(retHtml);

            // if match
            if(matches && matches.length >= 2) {
                // by regexp we get the deps of use modules
                // such as LBF.use(['a.b.c', 'c.e.f'], function... -> we get ['a.b.c', 'c.e.f'] out
                var useDeps = matches[1].replace(/(['"\s])/g, ''),
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
                var curDeps = {};
                for(var alias in curAlias) {
                    curDeps[alias] = moduleDeps[alias];
                }
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
}
