/**
 * Created by patrickliu on 14/11/25.
 */
// a simple function to traverse dir
var fs = require('fs'),
    path = require('path');

var walk = function(dir, callback) {
    fs.readdirSync(dir).forEach(function(item) {
        var crtDir = dir + path.sep + item;
        if(fs.statSync(crtDir).isDirectory()) {
            walk(crtDir, callback);
        } else {
            callback(crtDir);
        }
    });
}

exports = module.exports = walk;

