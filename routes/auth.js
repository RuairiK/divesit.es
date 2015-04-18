var express = require('express');
var mongoose = require('mongoose');
var User = require('../models/User');
var keys = require('../keys');

var app = require('../app');

// Satellizer requirements
var request = require('request');
var jwt = require('jwt-simple');
var moment = require('moment');
var qs = require('querystring');

var router = express.Router();

var TOKEN_EXPIRY_DAYS = 14;

/* Generate JSON web token */

var createToken = function (user) {
  var payload = {
    sub: user._id,
    iat: moment().unix(),
    exp: moment().add(TOKEN_EXPIRY_DAYS, 'days').unix()
  };
  return jwt.encode(payload, keys.tokenSecret);
}


/* Get profile */

// Middleware to require login
var ensureAuthenticated = function (req, res, next) {
  // TODO I'm not sure how this method handles bogus tokens...
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

router.get('/auth/profile', ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    res.send(user);
  });
});


/* Authenticate with Google */

router.post('/auth/google', function (req, res) {

  var accessTokenUrl = "https://accounts.google.com/o/oauth2/token";
  var peopleApiUrl = "https://www.googleapis.com/plus/v1/people/me/openIdConnect";
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: keys.google.clientSecret,
    redirect_uri: req.body.redirectUri,
    grant_type: 'authorization_code'
  };

  // Exchange authorization code for access token request 
  request.post(accessTokenUrl, {json: true, form: params}, function (err, response, token) {
    var accessToken = token.access_token;
    var headers = {Authorization: 'Bearer ' + accessToken};

    // Retrieve profile information about the current user
    request.get({url: peopleApiUrl, headers: headers, json: true}, function (err, response, profile) {
      console.log("Received profile");
      console.log(profile);
      // Link user accounts
      if (req.headers.authorization) {
        User.findOne({google: profile.sub}, function (err, existingUser) {
          if (existingUser) {
            return res.status(409).send({message: 'There is already a Google account that belongs to you'});
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, keys.tokenSecret);
          User.findById(payload.sub, function (err, user) {
            if (!user) {
              return res.status(400).send({message: 'User not found'});
            }
            user.google = profile.sub;
            user.picture = user.picture || profile.picture.replace('sz=50', 'sz=200');
            user.displayName = user.displayName || profile.name;
            user.save(function () {
              var token = createToken(user);
              res.send({token: token});
            });
          });
        });
      } else {
        // Create a new user account or return an existing one
        User.findOne({google: profile.sub}, function (err, existingUser) {
          if (existingUser) {
            return res.send({token: createToken(existingUser)});
          }
          var user = new User();
          user.google = profile.sub;
          user.picture = profile.picture.replace('sz=50', 'sz=200');
          user.displayName = profile.name;
          user.save(function (err) {
            var token = createToken(user);
            res.send({token: token});
          });
        });
      }
    });
  });
});

/* Authenticate with Facebook */
router.post('/auth/facebook', function (req, res) {
  var accessTokenUrl = 'https://graph.facebook.com/v2.3/oauth/access_token';
  var graphApiUrl = 'https://graph.facebook.com/v2.3/me';
  var params = {
    code: req.body.code,
    client_id: req.body.clientId,
    client_secret: keys.facebook.secret,
    redirect_uri: req.body.redirectUri
  };

  // Exchange auth code for access token
  request.get({ url: accessTokenUrl, qs: params, json: true }, function(err, response, accessToken) {
    if (response.statusCode !== 200) {
      return res.status(500).send({ message: accessToken.error.message });
    }
    
    // Retrieve profile information about the current user.
    request.get({ url: graphApiUrl, qs: {'access_token': accessToken.access_token}, json: true }, function(err, response, profile) {
      if (response.statusCode !== 200) {
        return res.status(500).send({ message: profile.error.message });
      }
      //console.log(response);
      if (req.headers.authorization) {
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            return res.status(409).send({ message: 'There is already a Facebook account that belongs to you' });
          }
          var token = req.headers.authorization.split(' ')[1];
          var payload = jwt.decode(token, config.TOKEN_SECRET);
          User.findById(payload.sub, function(err, user) {
            if (!user) {
              return res.status(400).send({ message: 'User not found' });
            }
            user.facebook = profile.id;
            user.picture = user.picture || 'https://graph.facebook.com/v2.3/' + profile.id + '/picture?type=large';
            user.displayName = user.displayName || profile.name;
            console.log("not step 3b");
            console.log("USER USER USER");
            console.log(user);
            user.save(function() {
              var token = createToken(user);
              res.send({ token: token });
            });
          });
        });
      } else {
        console.log("Step 3b");
        // Step 3b. Create a new user account or return an existing one.
        User.findOne({ facebook: profile.id }, function(err, existingUser) {
          if (existingUser) {
            var token = createToken(existingUser);
            return res.send({ token: token });
          }
          var user = new User();
          user.facebook = profile.id;
          user.picture = 'https://graph.facebook.com/' + profile.id + '/picture?type=large';
          user.displayName = profile.name;
          console.log("USER USER USER");
          console.log(user);
          user.save(function (err) {
            if (err) {
              console.log("err");
              console.log(err);
            }
            var token = createToken(user);
            res.send({ token: token });
          });
        });
      }
    });
  });
});

/* Export */
module.exports = router;
