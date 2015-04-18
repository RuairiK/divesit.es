var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var keys = require('./keys'); 

var app = express();

var mongodbConnString;
if (app.get('env') === 'test') {
  mongodbConnString = "mongodb://"
  + keys.mongotest.user + ":" + keys.mongotest.password + "@"
  + keys.mongotest.host + ":" + keys.mongotest.port + "/"
  + keys.mongotest.db;
} else {
  mongodbConnString = "mongodb://"
  + keys.mongolab.user + ":" + keys.mongolab.password + "@"
  + keys.mongolab.host + ":" + keys.mongolab.port + "/"
  + keys.mongolab.db
}
console.log(mongodbConnString);
console.log("Using environment: " + app.get('env'));

mongoose.connect(mongodbConnString, function(err){
  if(err){
    console.log('Database connection error', err);
  }else{
    console.log('Database connection successful');
  }
});

// "A man is not dead while his name is still spoken."
app.use(function (req, res, next) {
  res.set('X-Clacks-Overhead', 'GNU Terry Pratchett');
  next();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routing
var routes = require('./routes/index');
var divesites = require('./routes/divesites');
var auth = require('./routes/auth');
app.use('/', routes);
app.use('/divesites', divesites);
// Authentication routes
app.use('/', auth);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});


// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
