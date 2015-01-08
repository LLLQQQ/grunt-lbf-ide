/**
 * @fileOverview
 * @author amoschen
 * @version
 * Created: 13-5-22 下午3:48
 */
/**
 * Grep dependencies from code
 * @returns {Object}
 */
module.exports = function(fileText){
    // grep require module from factory code
    var FACTORY_RE = /LBF.define\(\s*['"]([^'"]+)['"]\s*,\s*(function[\w\W]*})\);?\s*$/g,
        REQUIRE_RE = /"(?:\\"|[^"])*"|'(?:\\'|[^'])*'|\/\*[\S\s]*?\*\/|\/(?:\\\/|[^/\r\n])+\/(?=[^\/])|\/\/.*|\.\s*require|(?:^|[^$])\brequire\s*\(\s*(["'])(.+?)\1\s*\)/g,
        SLASH_RE = /\\\\/g,
        REQUIRE_NAME_RE = /^function[\s]*\([\s]*([^\f\n\r\t\v,\)]+)/;

    var matches = FACTORY_RE.exec(fileText);

    if(!matches){
        return;
    }

    var path = matches[1],
        factory = matches[2];

    if(!path || !factory){
        return;
    }

    // get require function name
    // in compress code, require function name is no longer 'require'
    var requireName = REQUIRE_NAME_RE.exec(factory);
    if(requireName){
        // get require name
        requireName = requireName[1];
        // reconstruct require regexp
        REQUIRE_RE = REQUIRE_RE.toString().replace(/require/g, requireName);
        REQUIRE_RE = REQUIRE_RE.slice(1, REQUIRE_RE.length - 2);
        REQUIRE_RE = new RegExp(REQUIRE_RE, 'g');
    }

    // grep deps by using regexp match
    var ret = [];

    factory.replace(SLASH_RE, "")
        .replace(REQUIRE_RE, function(m, m1, m2) {
            m2 && ret.push(m2);
        });

    return ret.length > 0 ? { path: path, deps: ret } : null;
};