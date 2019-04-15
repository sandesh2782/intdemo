var mongoose = require('mongoose');

var dbURI = 'mongodb://localhost/intDemoDB';

var gracefulShutDown;

// Set process env. for dbURI in case prod node env
if(process.env.NODE_ENV === 'production') {
    process.env.dbURI = dbURI;
}

// Connect to MongoDB
mongoose.connect(dbURI);

// Listening to connected event
mongoose.connection.on('connected', function(){
    console.log('MongoDB connected to ', dbURI);
});

// Listening to error event
mongoose.connection.on('error', function(err) {
    console.log('MongoDB could not able to connect due to ', err);
});

// Listening to disconnected event
mongoose.connection.on('disconnected', function(){
    console.log('MongoDB disconnected!!!');
});


// Function to call for graceful app termination
gracefulShutDown = function(msg, callback) {
    mongoose.connection.close(function(){
        console.log('MongoDB disconnected through ', msg);
        callback();
    });
};

// Capture all app terminations gracefully

// For nodemon restarts
process.on('SIGUSR2', function(){
    gracefulShutDown('nodemon restart', function(){
        process.kill(process.pid, 'SIGUSR2');
    })
});

// For app termination using Ctrl + C combo
process.on('SIGINT', function() {
    gracefulShutDown('App terminated', function(){
        process.exit(0);
    });
});

// For heroku app termincation
process.on('SIGTERM', function(){
    gracefulShutDown('heroku app terminated', function(){
        process.exit(0);
    });
})

require('./users');