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
// Authentication middleware
var auth = require('../middleware/auth');

var router = express.Router();



/* Get profile */


router.get('/auth/profile', auth.ensureAuthenticated, function (req, res) {
  User.findById(req.user, function (err, user) {
    res.send(user);
  });
});


/* Authenticate with Google */

router.post('/auth/google', auth.authenticateWithGoogle);

/* Authenticate with Facebook */
router.post('/auth/facebook', auth.authenticateWithFacebook); 

/* TODO Authenticate with email/password */

/* Export */
module.exports = router;
