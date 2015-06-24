var loopback = require('loopback');
var boot = require('loopback-boot');
var app = module.exports = loopback();

// Logger
var logger = require('morgan');
app.use(logger('dev'));
// Passport config
var loopbackPassport = require('loopback-component-passport');
var PassportConfigurator = loopbackPassport.PassportConfigurator;
var passportConfigurator = new PassportConfigurator(app);

/* For now, leave the authentication out of here: it messes with CI tests
 * TODO: put third-party API keys into environment variables on travis-ci.org
 */
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'development') {
  // Load provider configurations
  var config = {};
  try {
    config = require('./providers.json');
  } catch (err) {
    console.error('Error loading providers.json');
    process.exit(1);
  }
  // Initialize Passport
  passportConfigurator.init();
  //passportConfigurator.setupModels();
  passportConfigurator.setupModels({
    userModel: app.models.User,
    userIdentityModel: app.models.UserIdentity,
    userCredentialModel: app.models.UserCredential
  });
  for (var s in config) {
    var c = config[s];
    c.session = c.session !== false;
    passportConfigurator.configureProvider(s, c);
  }
}


app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    console.log('Web server listening at: %s', app.get('url'));
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});

