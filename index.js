
exports.loadTasks = function(grunt){
    // hengine tasks
    grunt.loadTasks(require('./hengine/tasks/http'));
    grunt.loadTasks(require('./hengine/tasks/tcache'));

    // local server
    grunt.loadTasks(require('./localServer/tasks/localServer'));

    // sorry no 304
    grunt.loadTasks(require('./sorryNo304/tasks/sorryNo304'));
};