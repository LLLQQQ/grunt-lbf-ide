/**
 *
 * @author patrickliu
 * @date 1/8/15
 */

module.exports = function(grunt) {
    // hengine tasks
    grunt.loadTasks('./src/hengine/tasks');
    grunt.loadTasks('./src/hengine/tasks');

    // local server
    grunt.loadTasks('./src/localServer/tasks');

    // sorry no 304
    grunt.loadTasks('./src/sorryNo304/tasks');
};
