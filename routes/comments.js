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

function isValidObjectID(_id) {
  return _id && mongoose.Types.ObjectId.isValid(_id);
}

/* GET all comments */
router.get('/', function (req, response, next) {
  // Currently not allowed; we may want to allow a feed for recent comments
  // but we can implement that when we feel like it
  return response.status(HTTP.NOT_FOUND).json({});
});


/* GET an individual comment by ID */
router.get('/:id', function (req, response, next) {
  var commentId = req.params.id;
  // Validate comment ID before asking Mongoose to parse it
  if (!isValidObjectID(commentId)) {
    // Any invalid IDs return 404s
    return response.status(HTTP.NOT_FOUND).json({});
  }
  Comment.findOne({_id: commentId}, function (err, comment) {
    if (err) {return next(err); }
    if (!comment) {
      return response.status(HTTP.NOT_FOUND).json({});
    }
    return response.json(comment);
  });
})


/* POST a new comment to no divesite */
router.post('/', function (req, response, next) {
  response.status(HTTP.METHOD_NOT_ALLOWED).json({});
});


/* DELETE a comment */
router.delete('/:id', function (req, response, next) {
  if (!(commentId && mongoose.Types.ObjectId.isValid(commentId))) {
    return response.status(HTTP.NOT_FOUND).json({});
  }
});


/* PATCH an existing comment */
router.patch('/:id', auth.ensureAuthenticated, function (req, response, next) {
  var commentId = req.params.id;
  // Validate comment ID before passing it to Mongoose
  if (!isValidObjectID(commentId)) {
    return response.status(HTTP.NOT_FOUND).json({});
  }
  Comment.findOne({_id: commentId}, function (err, comment) {
    if (err) {return next(err);}
    // Return a 404 if we can't retrieve the comment
    if (!comment) {
      return response.status(HTTP.NOT_FOUND).json({});
    }
    // Users can only edit their own comments
    if (req.user != comment.user._id) {
      return response.status(HTTP.FORBIDDEN).json({});
    } 
    // The only changes allowed are to the comment text
    Comment.findByIdAndUpdate({_id: commentId}, {text: req.body.text}, function (err, numAffected, data) {
      if (err) {return next(err);}
      return response.status(HTTP.OK).json(numAffected);
    });
  });
});

module.exports = router;
