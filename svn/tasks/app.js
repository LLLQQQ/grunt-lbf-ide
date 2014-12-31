/**
 * Created by patrickliu on 14/11/25.
 */

var svn = require('../../utils/SVNOperation');

exports = module.exports = function(grunt) {
    grunt.registerMultiTask('svnUp', 'svn up in designated dir', function() {
        var options = this.options(),
            file = options.file;

        var done = this.async();
        svn.up(file, function(err, data) {
            if(err) {
                grunt.fail.warn('update error, please check this.' + err);
            }
            console.log(data);
            done();
        });
    });

    grunt.registerMultiTask('svnInfo', 'svn info in current dir or file', function() {
        var options = this.options(),
            file = options.file;

        var done = this.async();
        svn.info(file, function(err, data) {
            if(err) {
                grunt.fail.warn('get info error, please check error ' + err);
            }
            console.log(data);
            done();
        });

    });

    grunt.registerMultiTask('svnDel', 'svn delete in currentDir or file', function() {
        var options = this.options(),
            file = options.file;

        var done = this.async();
        svn.del(file, function(err, data) {
            if(err) {
                grunt.fail.warn('del info error, please check error ' + err);
            }
            console.log(data);
            done();
        });

    });

    grunt.registerMultiTask('svnAdd', 'svn add in currentDir or file ', function() {

        var options = this.options(),
            file = options.file;

        var done = this.async();
        svn.add(file, function(err, data) {
            if(err) {
                grunt.fail.warn('add info error, please check error ' + err);
            }
            console.log(data);
            done();
        });
    });

    grunt.registerMultiTask('svnCi', 'svn commit in currentDir or file ', function() {

        var options = this.options(),
            file = options.file,
            comment = options.comment;

        var done = this.async();
        svn.ci(file, comment, function(err, data) {
            if(err) {
                grunt.fail.warn('commit info error, please check error ' + err);
            }
            console.log(data);
            done();
        });
    });
};
