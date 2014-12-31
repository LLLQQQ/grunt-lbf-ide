/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-5-22 下午4:26
 */

var fs = require('fs'),
    walk = require('./../../utils/traverseDir'),
    grep = require('./../grep'),
    jsBeautify = require('js-beautify').js_beautify;

// borrowed from lbf tools
module.exports = exports = function(grunt) {
    grunt.registerTask('generateDeps', 'generating deps for lbf modules', function() {

        var options = this.options(),
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

            writeToLocalsJson(exportFilePath, deps);

        } else {
            console.log(deps);
        }

        function writeToLocalsJson(localsJsonPath, deps) {
            // 读取localsJson
            try {
                // set值之后，我们再次写回去
                fs.writeFileSync(localsJsonPath, jsBeautify(JSON.stringify(deps)));

            } catch(e) {
                grunt.log.warn('write to locals json error' + e.toString());
            }
        }
    });
};


