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
  // If we get a 'bounds' parameter, find divesites within the polygon
  if (req.query.bounds) {
    if (!validation.validateBounds(req.query.bounds)) {
      return res.status(HTTP.BAD_REQUEST).json({});
    }
    //var bounds = req.query.bounds.split(',').map(function (x) {return parseFloat(x)});
    var bounds = req.query.bounds.map(function (x) {return parseFloat(x)});
    var n = bounds[0],
      w = bounds[1],
      s = bounds[2],
      e = bounds[3];
    // We need to pass Mongo [lng, lat] rather than [lat, lng] pairs
    var coords = [ [w, n], [e, n], [e, s], [w, s], [w, n] ];
    var polygon = {type: "Polygon", coordinates: [coords]};
    Divesite.find({loc: {$geoWithin: {$geometry: polygon}}}, function (err, divesites) {
      if (err) return next(err);
      return res.status(HTTP.OK).json(divesites);
    });
  } else {Divesite.find(function(err, divesites) {
    // Otherwise, return a list of all the divesites in the db
    if (err) return next(err);
    return res.status(HTTP.OK).json(divesites);
  });
  }
});

/* POST a new dive site */
router.post('/', auth.ensureAuthenticated, function(req, res, next) {
  // Parse the incoming data to build a schema-compatible object
  var site = {
    name: req.body.name,
    category: req.body.category,
    loc: [parseFloat(req.body.coords.longitude), parseFloat(req.body.coords.latitude)],
    chart_depth: req.body.depth,
    creator_id: req.user
  };

  // Create the object
  Divesite.create(site, function(err, post) {
    if (err) return next(err);
    res.status(HTTP.CREATED).json(post);
  });
});

/* GET /divesites/id */
router.get('/:id', validation.hasValidIdOr404, validation.findObjectOr404(Divesite), function(req, res, next) {
  var site = req.obj;
  res.status(HTTP.OK).json(req.obj);
});


/* PATCH /divesites/:id */
router.patch('/:id', auth.ensureAuthenticated, validation.hasValidIdOr404, validation.findObjectOr404(Divesite), function (req, res, next) {
  var site = req.obj;
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


/* DELETE /divesites/:id */
router.delete('/:id', auth.ensureAuthenticated, validation.hasValidIdOr404, validation.findObjectOr404(Divesite), function(req, res, next) {
  var site = req.obj;
  if (req.user != site.creator_id) {
    // Only a site's creator can delete it
    return res.status(HTTP.FORBIDDEN).json({});
  }
  // Remove the object
  Divesite.findById({_id: site._id}).remove(function (err, done) {
    if (err) return next(err);
    res.status(HTTP.NO_CONTENT).json({});
  });
});




/* Divesite comments */

/* GET comments for a divesite */
router.get('/:id/comments', validation.hasValidIdOr404, validation.findObjectOr404(Divesite), function (req, res, next) {
  var site = req.obj;
  // Return comments
  Comment.find({divesite_id: site._id}, function (err, data) {
    if (err) { return next(err); }
    return res.status(HTTP.OK).json(data);
  });
});

/* POST a new comment for a divesite */
router.post('/:id/comments', auth.ensureAuthenticated, validation.hasValidIdOr404, validation.findObjectOr404(Divesite), function (req, response, next) {
  // User ID is supplied by the authentication middleware
  var userId = req.user;
  // Site is supplied by validation middleware
  var site = req.obj;
  // Validate text
  var text = req.body.text;
  if (!text) {
    return response.status(HTTP.BAD_REQUEST).json({});
  }
  User.findOne({_id: userId}, function (err, user) {
    if (err) return next(err);
    var comment = {
      divesite_id: site._id,
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

module.exports = router;
