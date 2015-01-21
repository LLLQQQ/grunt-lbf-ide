/**
 * Created by patrickliu on 14/11/11.
 */

// this is a helper for cgi

var path = require('path'),
    url = require('url'),
    queryString = require('querystring'),
    fs = require('fs'),
    underscore = require('underscore');

var helper = function(req, callback) {
    var method = req.method.toLowerCase(),
        objectUrl = url.parse(req.url),
        queryStringObj = {},
        tools = {
            // add underscore helper
            _: underscore
        };

    console.log('[CGIHelper] enter helper init');
    console.log('[CGIHelper] %s %s', method, req.url);

    // 如果是get方法
    if( /get|delete/.test( method ) ) {
        // 获取get请求 http://qq.com?a=hi -> {"a": "hi"}
        queryStringObj = queryString.parse(objectUrl.query);
        tools.body = queryStringObj;
    } else {
        tools.body = req.body;
    }

    console.log(tools.body);
    callback && callback(null, tools);
};


module.exports = exports = helper;