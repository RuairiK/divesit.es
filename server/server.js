var bodyParser = require('body-parser');
var loopback = require('loopback');
var path = require('path');
var boot = require('loopback-boot');
var app = module.exports = loopback();
var satellizer = require('loopback-satellizer');

// Logger
var logger = require('morgan');
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

boot(app, __dirname);

app.use(loopback.static(path.resolve(__dirname, '../public')));

var satellizerConfig = require('./satellizer-config');
satellizer(app, satellizerConfig);

var indexPath = path.resolve(__dirname, '../public/index.html');
app.get('*', function (req, res) {res.sendFile(indexPath); });

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

if (require.main === module) {
  app.start();
}


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
/*
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
*/
