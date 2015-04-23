var User = require('../models/User');

var ensureAuthenticated = function (req, res, next) {
  // if we pass {'forceAuthenticate': true, "id": $_id} in the request headers
  // we can override authentication checks and forcibly override as $NAME

  if (req.headers['force-authenticate'] && req.headers['auth-id']) {
    User.findOne({_id: req.headers['auth-id']}, function (err, user) {
      if (err) { return next(err); } 
      // Casting this to a String seems to fix a weird bug that causing
      // req.user != user._id
      req.user = "" + user._id;
      next();
    });
  } else {
    if (!req.headers.authorization) {
      return res.status(401).send({message: 'No Authorization token'});
    }
    var token = req.headers.authorization.split(' ')[1];
    var payload = jwt.decode(token, keys.tokenSecret);
    if (payload.exp <= moment().unix()) {
      return res.status(401).send({message: 'Token has expired'});
    }
    req.user = payload.sub;
    next();
  }
}

// TODO: flesh these out for further testing
var authenticateWithGoogle = function () {};
var authenticateWithFacebook = function () {}; 
var createToken = function () {}; 

module.exports.ensureAuthenticated = ensureAuthenticated;
module.exports.createToken = createToken;
module.exports.authenticateWithGoogle = authenticateWithGoogle;
module.exports.authenticateWithFacebook = authenticateWithFacebook;
