var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

var auth = require('../middleware/auth');

var Divesite = require('../models/Divesite');
var User = require('../models/User');
var Comment = require('../models/Comment');

router.get('/:id/comments', function (req, res, next) {
    var siteID = req.params.id;
    // Validate site ID
    if (!siteID && Mongoose.Types.ObjectId.isValid(siteId)) {
        return res.status(400).json({'message': 'Invalid or missing site ID'});
    }
    Comment.find({divesite_id: siteID}, function (err, data) {
        if (err) { return next(err); }
        console.log(data);
        return res.json(data);
    });
});

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
        console.log(user);
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
            console.log(comment);
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
