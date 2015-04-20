var User = require('../models/User');

var ensureAuthenticated = function (req, res, next) {
    // if we pass {'forceAuthenticate': true, "displayName": $NAME} in the body of the request,
    // we can override authentication checks and forcibly override as $NAME
    
    //console.log("ensureAuthenticated: request body:");
    //console.log(req.body);
    if (req.body.forceAuthenticate) {
        User.findOne({displayName: req.body.displayName}, function (err, user) {
            if (err) { return next(err); } 
            req.user = user._id;
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
