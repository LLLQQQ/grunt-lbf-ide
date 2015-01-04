
exports.loadTasks = function(grunt){
    // hengine tasks
    grunt.loadTasks(__dirname + '/hengine/tasks');
    grunt.loadTasks(__dirname + '/hengine/tasks');

    // local server
    grunt.loadTasks(__dirname + '/localServer/tasks');

    // sorry no 304
    grunt.loadTasks(__dirname + '/sorryNo304/tasks');
};