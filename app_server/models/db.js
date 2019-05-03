var mongoose = require('mongoose');
var gracefulShutdown;

gracefulShutdown = function(msg, callback) {
    mongoose.connection.close(function() {
        console.log('Mongoose disconnected through ' + msg);
        callback();
    });
};

// for nodemon restarts
process.once('SIGUSR2', function() {
    gracefulShutdown('nodemon restart', function() {
        process.kill(process.pid, 'SIGUSR2');
    });
});

// For app_server termination
process.once('SIGINT', function() {
    gracefulShutdown('app_server termination', function() {
        process.exit(0);
    });
});

// For Heroku app_server termination
process.once('SIGTERM', function() {
    gracefulShutdown('Heroku app_server shutdown', function() {
        process.exit(0);
    });
});

require ('./user');