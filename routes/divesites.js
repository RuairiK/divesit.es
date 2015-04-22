var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Divesite = require('../models/Divesite');
var User = require('../models/User');
var Comment = require('../models/Comment');

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

    Divesite.find( function(err, divesites) {
        if(err) {
            return next(err);
        }
        return res.json(divesites);
    })
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
router.get('/:id', function(req, res, next) {
    // Check that the ID is a valid Mongoose ObjectID and 404 early
    // (otherwise Mongoose tries to cast it and returns a 500 Server Error)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(HTTP.NOT_FOUND).send();
    }
    Divesite.findById(req.params.id, function (err, data) {
        if (err) {
            return next(err);
        }
        if (!data) {
            // Return 404 if there's no record
            return res.status(HTTP.NOT_FOUND).send();
        } 
        // Otherwise, send the data
        res.json(data);
    });
});

/* PUT /divesites/:id */
// TODO: This is the more appropriate HTTP verb for complete replacements.
// HTTP PATCH more accurately reflects the behaviour of mongoose#findByIdAndUpdate
router.put('/:id', auth.ensureAuthenticated, function(req, res, next) {
    Divesite.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* PATCH /divesites/:id */
router.patch('/:id', auth.ensureAuthenticated, function (req, res, next) {
    Divesite.findByIdAndUpdate(req.params.id, req.body, function (err, data) {
        if (err) return next(err);
        res.json(data);
    });
});

/* DELETE /divesites/:id */
router.delete('/:id', auth.ensureAuthenticated, function(req, res, next) {
    Divesite.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

/* Divesite comments */

/* GET comments for a divesite */
router.get('/:id/comments', function (req, res, next) {
    var siteID = req.params.id;
    // Validate site ID
    if (!siteID && Mongoose.Types.ObjectId.isValid(siteId)) {
        return res.status(HTTP.NOT_FOUND).send();
    }
    Comment.find({divesite_id: siteID}, function (err, data) {
        if (err) { return next(err); }
        return res.json(data);
    });
});

/* POST a new comment for a divesite */
router.post('/:id/comments', auth.ensureAuthenticated, function (req, response, next) {
    // Validate site ID
    var siteId = req.params.id;
    if (!(siteId && mongoose.Types.ObjectId.isValid(siteId))) {
        return response.status(400).json({'message': 'Invalid or missing site ID'});
    }
    // Validate user ID
    var userId = req.body.user_id;
    if (!(userId && mongoose.Types.ObjectId.isValid(userId))) {
        return response.status(400).json({'message': 'Invalid or missing user ID'});
    }
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
                response.json(res);
            });
        });
    });
    // We should have returned by now
    //response.status(500).send(); // for now send not implemented
});

module.exports = router;
