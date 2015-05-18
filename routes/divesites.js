var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var Divesite = require('../models/Divesite');
var User = require('../models/User');
var Comment = require('../models/Comment');
var validation = require('../middleware/validation');

// HTTP status codes
var HTTP = require('http-status-codes');

// Authentication middleware
var auth;
if (process.env.NODE_ENV == 'test') {
  auth = require('../middleware/test-auth');
} else {
  auth = require('../middleware/auth');
}

/* GET dive sites listing. */
router.get('/', function(req, res, next) {
  // If we receive a querystring with a 'name' parameter, find a list
  // of matches
  if (req.query.name) {
    return Divesite.find({name: {$regex: req.query.name, $options: 'i'}}, function (err, divesites) {
      if(err) return next(err);
      return res.status(HTTP.OK).json(divesites);
    });
  }
  Divesite.find(function(err, divesites) {
    if(err) {
      return next(err);
    }
    return res.status(HTTP.OK).json(divesites);
  });
});

/* POST a new dive site */
router.post('/', auth.ensureAuthenticated, function(req, res, next) {
  // Parse the incoming data to build a schema-compatible object
  var site = {
    name: req.body.name,
    category: req.body.category,
    loc: [parseFloat(req.body.coords.longitude), parseFloat(req.body.coords.latitude)],
    chart_depth: req.body.depth
  };

  // Create the object
  Divesite.create(site, function(err, post) {
    if (err) return next(err);
    res.status(HTTP.CREATED).json(post);
  });
});

/* GET /divesites/id */
router.get('/:id', validation.hasValidIdOr404, function(req, res, next) {
  Divesite.findById(req.params.id, function (err, data) {
    if (err) {
      return next(err);
    }
    if (!data) {
      // Return 404 if there's no record
      return res.status(HTTP.NOT_FOUND).json({});
    } 
    // Otherwise, send the data
    res.json(data);
  });
});


/* PATCH /divesites/:id */
router.patch('/:id', auth.ensureAuthenticated, validation.hasValidIdOr404, function (req, res, next) {
  Divesite.findById(req.params.id, function (err, site) {
    if (!site) return res.status(HTTP.NOT_FOUND).json({}); // Handle valid IDs with no match
    // Whitelisted fields:
    // name, loc, depth, description, category
    site.name = req.body.name || site.name;
    site.loc = req.body.coords && req.body.coords.latitude && req.body.coords.longitude ?
      [req.body.coords.latitude, req.body.coords.longitude] : site.loc;
    site.chart_depth = req.body.depth || site.chart_depth;
    site.description = req.body.description || site.description;
    site.category = req.body.category || site.category;
    site.updated_at = Date.now();
    // Save and return the site or errors
    site.save(function (err) {
      if (err) return res.status(HTTP.BAD_REQUEST).json(err);
      return res.status(HTTP.OK).json(site);
    });
  });
});


/* DELETE /divesites/:id */
router.delete('/:id', auth.ensureAuthenticated, validation.hasValidIdOr404, function(req, res, next) {
  Divesite.findById(req.params.id, req.body, function (err, site) {
    if (err) return next(err);
    if (!site) return res.status(HTTP.NOT_FOUND).json({});
    if (req.user != site.creator_id) {
      // Only a site's creator can delete it
      return res.status(HTTP.FORBIDDEN).json({});
    }
    Divesite.findById({_id: site._id}).remove(function (err, done) {
      if (err) return next(err);
      res.status(HTTP.NO_CONTENT).json({});
    });
  });
});




/* Divesite comments */

/* GET comments for a divesite */
router.get('/:id/comments', function (req, res, next) {
  var siteId = req.params.id;
  // Validate site ID
  if (!(siteId && mongoose.Types.ObjectId.isValid(siteId))) {
    return res.status(HTTP.NOT_FOUND).json({});
  }
  Divesite.find({_id: siteId}, function (err, site) {
    // If the site isn't in the db, return 404
    if (!site) return res.status(HTTP.NOT_FOUND).json({});
    // Return comments
    Comment.find({divesite_id: siteId}, function (err, data) {
      if (err) { return next(err); }
      return res.status(HTTP.OK).json(data);
    });
  });
});

/* POST a new comment for a divesite */
router.post('/:id/comments', auth.ensureAuthenticated, function (req, response, next) {
  // Validate site ID
  var siteId = req.params.id;
  if (!(siteId && mongoose.Types.ObjectId.isValid(siteId))) {
    return response.status(400).json({'message': 'Invalid or missing site ID'});
  }
  // User ID is supplied by the authentication service
  var userId = req.user;
  // Validate text
  var text = req.body.text;
  if (!text) {
    return response.status(400).json({'message': 'Empty comment'});
  }
  // Step 1: find the user
  User.findOne({_id: userId}, function (err, user) {
    if (err) { return next(err); }
    // Step 2: find the site
    Divesite.findOne({_id: siteId}, function (err, site) {
      if (err) { return next(err); }
      if (!site) return response.status(400).json({'message': 'Invalid or missing site ID'});
      // User and site are valid
      var comment = {
        divesite_id: req.params.id,
        user: {
          _id: user._id,
          picture: user.picture,
          displayName: user.displayName
        },
        text: text
      };
      Comment.create(comment, function (err, res) {
        if (err) { return next(err); }
        response.status(HTTP.CREATED).json(res);
      });
    });
  });
});

module.exports = router;
