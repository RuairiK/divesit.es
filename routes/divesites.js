var express = require('express');
var router = express.Router();

var mongoose = require('mongoose');
var Divesite = require('../models/Divesite');

/* GET dive sites listing. */
router.get('/', function(req, res, next) {
    Divesite.find( function(err, divesites) {
        if(err) {
          return next(err);
        }
        res.json(divesites);
      })
  });

/* POST a new dive site */
router.post('/', function(req, res, next) {
    // Parse the incoming data to build a schema-compatible object
    var site = {
      name: req.body.name,
      category: req.body.category,
      loc: [parseFloat(req.body.coords.longitude), parseFloat(req.body.coords.latitude)],
      chart_depth: req.body.depth
    }

    // Create the object
    Divesite.create(site, function(err, post) {
        if (err) return next(err);
        res.json(post);
      }
    );
  });

/* GET /divesites/id */
router.get('/:id', function(req, res, next) {
    Divesite.findById(req.params.id, function (err, post) {
        if (err) return next(err);
        res.json(post);
      });
  });

/* PUT /divesites/:id */
router.put('/:id', function(req, res, next) {
    Divesite.findByIdAndUpdate(req.params.id, req.body, function (err, post) {
        if (err) return next(err);
        res.json(post);
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
