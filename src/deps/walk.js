/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-5-22 下午3:50
 */
var fs = require('fs');

var walk = module.exports = function(dir, callback){
    fs.readdirSync(dir).forEach(function(item){
        var path = dir + '/' + item;
        if(fs.statSync(path).isDirectory()){
            walk(path, callback);
        } else {
            callback(path);
        }
    });
};