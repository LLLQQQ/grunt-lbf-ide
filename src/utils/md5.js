/**
 * Created by patrickliu on 11/27/14.
 */

var MD5 = require('MD5');

var md5 = {
    get16MD5: function(content) {
        return MD5(content).split('').slice(8, 24).join('');
    }
};

exports = module.exports = md5;
