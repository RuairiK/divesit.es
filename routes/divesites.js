var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Divesite = require('../models/Divesite');
var User = require('../models/User');

// Authentication middleware
var auth = require('../middleware/auth');

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
        res.json(post);
    });
});

/* GET /divesites/id */
router.get('/:id', function(req, res, next) {
    // Check that the ID is a valid Mongoose ObjectID and 404 early
    // (otherwise Mongoose tries to cast it and returns a 500 Server Error)
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        return res.status(404).send();
    }
    Divesite.findById(req.params.id, function (err, data) {
        if (err) {
            return next(err);
        }
        if (!data) {
            // Return 404 if there's no record
            return res.status(404).send();
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
router.delete('/:id', function(req, res, next) {
    Divesite.findByIdAndRemove(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
    });
});

module.exports = router;
