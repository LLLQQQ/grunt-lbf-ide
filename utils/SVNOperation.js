/**
 * Created by patrickliu on 11/25/14.
 */
// here is some basic operation for svn
var exec = require('child_process').exec,
    path = require('path');

var svn = {
    info: function(pathName, callback) {
        var filename = path.basename(pathName),
            cmd = 'cd ' + pathName + ' && ' + ' svn info ' + filename;
        exec(cmd, function(err, stdout, stderr) {
            if(err) {
                callback(err, stdout, stderr);
            } else {
                callback(null, stdout, stderr);
            }
        });
    },


    up: function(pathName, callback) {
        var cmd = 'cd ' + pathName + ' && ' + ' svn up'

        exec(cmd, function(err, stdout, stderr) {
            if(err) {
                callback(err);
            } else {
                callback(null, stdout, stderr);
            }
        });
    },

    // force to delete pathName
    del: function(pathName, callback) {
        var cmd = ' svn del ' + pathName + ' --force';

        exec(cmd, function(err, stdout, stderr) {
            if(err) {
                callback(err);
            } else {
                callback(null, stdout, stderr);
            }
        });
    },

    // svn add
    add: function(pathName, callback) {
        var cmd = ' svn add ' + pathName + ' ';

        exec(cmd, function(err, stdout, stderr) {
            if(err) {
                callback(err);
            } else {
                callback(null, stdout, stderr);
            }
        });
    },

    ci: function(pathName, comment, callback) {

        var cmd = 'cd ' + pathName + ' && ' + ' svn ci -m "' + comment + '"';
        console.log(cmd);

        exec(cmd, function(err, stdout, stderr) {
            if(err) {
                callback(err);
            } else {
                console.log(stdout);
                callback(null, stdout, stderr);
            }
        });
    }
};

module.exports = exports = svn;
