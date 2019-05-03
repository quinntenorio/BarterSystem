var mongoose = require('mongoose');
var gracefulShutdown;
var dbURI = 'mongodb://localhost/barter';
if (process.env.NODE_ENV === 'production') {
    dbURI = 'mongodb://true:true1174@ds261678.mlab.com:61678/true446';
}
mongoose.connect(dbURI);

mongoose.connection.on('connected', function() {
    console.log('Mongoose connected to ' + dbURI);
});

mongoose.connection.on('error', function(err) {
    console.log('Mongoose connection error ' + err);
});

mongoose.connection.on('disconnected', function() {
    console.log('Mongoose disconnected');
});

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

require ('../../app_server/models/user');