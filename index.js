/**
 *
 * @author patrickliu
 * @date 1/8/15
 */

module.exports = function(grunt) {
    // hengine tasks
    grunt.loadTasks(__dirname + '/src/hengine/tasks');
    grunt.loadTasks(__dirname + '/src/hengine/tasks');

    // local server
    grunt.loadTasks(__dirname + '/src/localServer/tasks');

    // sorry no 304
    grunt.loadTasks(__dirname + '/src/sorryNo304/tasks');
};
