var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var HTTP = require('http-status-codes');

var Divesite = require('../models/Divesite');
var User = require('../models/User');
var Comment = require('../models/Comment');

var auth;
if (process.env.NODE_ENV == 'test') {
  auth = require('../middleware/test-auth');
} else {
  auth = require('../middleware/auth');
}

/* GET all comments */
router.get('/', function (req, response, next) {
  return response.status(HTTP.NOT_FOUND).send();
});

/* GET an individual comment by ID */
router.get('/:id', function (req, response, next) {
  var commentId = req.params.id;
  if (!(commentId && mongoose.Types.ObjectId.isValid(commentId))) {
    return response.status(HTTP.NOT_FOUND).send();
  }
  Comment.findOne({_id: commentId}, function (err, comment) {
    if (err) {return next(err); }
    if (!comment) {
      return response.status(HTTP.NOT_FOUND).send();
    }
    return response.json(comment);
  });
})

/* POST a new comment to no divesite */
router.post('/', function (req, response, next) {
  response.status(HTTP.METHOD_NOT_ALLOWED).send();
});

/* PATCH an existing comment */
router.patch('/:id', auth.ensureAuthenticated, function (req, response, next) {
  var commentId = req.params.id;
  if (!(commentId && mongoose.Types.ObjectId.isValid(commentId))) {
    return response.status(HTTP.NOT_FOUND).send();
  }
  Comment.findOne({_id: commentId}, function (err, comment) {
    if (err) {return next(err);}
    if (req.user != comment.user._id) {
      return response.status(HTTP.FORBIDDEN).json({});
    } 
    // The only changes allowed are to the comment text
    Comment.findByIdAndUpdate({_id: commentId}, {text: req.body.text}, function (err, numAffected, data) {
      if (err) {return next(err);}
      return response.json(numAffected);
    });
  });
});

module.exports = router;
