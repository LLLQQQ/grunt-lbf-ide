/**
 * Created by patrickliu on 11/5/14.
 */
var path = require('path');
module.exports = exports = function() {
    return function(req, res, next) {
        // 将req.url进行修改
        var url = req.url,
            regexp = /-[0-9a-zA-Z]*\.js/;

        // 如果url满足 ../a.r20131212.js
        if(regexp.test(url)) {
            var urlReplace = /(-[0-9a-zA-z]*)\.js/;

            url = url.replace(urlReplace, function() {
                return '.js';
            });

            // set this value
            req.url = url;

            console.log('url ' + url + ' is successfully removed the version');

            // set the header Cache-Control max-age = 10 days
            res.setHeader('Cache-Control', 'max-age=' + 10 * 24* 60 * 60);

            console.log('set Cache-Control' + res.getHeader('Cache-Control'));
        }

        next();
    }
}
