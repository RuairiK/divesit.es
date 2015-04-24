var express = require('express');
var router = express.Router();

// User model schema
var User = require('../models/User');

// Satellizer requirements
var request = require('request');
var jwt = require('jwt-simple');
var moment = require('moment');
var qs = require('querystring');
// Authentication middleware (environment-specific)
var auth;

/* Environment-specific settings */
if (process.env.NODE_ENV == 'test') {
    auth = require('../middleware/test-auth');
} else {
    auth = require('../middleware/auth');
}

/* Get profile */
router.get('/profile', auth.ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    res.send(user);
  });
});

/* Authenticate with Google */
router.post('/google', auth.authenticateWithGoogle);

/* Authenticate with Facebook */
router.post('/facebook', auth.authenticateWithFacebook); 

/* TODO Authenticate with email/password */

/* Export */
module.exports = router;
