var Divesite = require.main.require('models/Divesite');
var User = require.main.require('models/User');
var Comment = require.main.require('models/Comment');

function tearDown () {
  User.find().remove().exec();
  Divesite.find().remove().exec();
  Comment.find().remove().exec();
}

var USERNAME = 'TEST_USER';

function createUser (done) {
    User.create({displayName: USERNAME, picture: 'http://example.com/example.png'}, function (err, user) {
      if (err) return done(err);
      done();
    });
}

function createSiteAndUser (done) {
  var newSite = {
    name: "TEST_DIVESITE",
    category: "wreck",
    chart_depth: 100,
    loc: [0, 0]
  };
  Divesite.create(newSite, function (err, site) {
    if (err) return done(err);
    User.create({displayName: USERNAME, picture: 'http://example.com/example.png'}, function (err, user) {
      if (err) return done(err);
      done();
    });
  });
}

function destroyAllComments (done) {
  Comment.find().remove(done);
}

function createComment(done) {
  // Before each test, create a comment
  Divesite.findOne(function (err, site) {
    User.findOne({displayName: USERNAME}, function (err, user) {
      if (err) return done(err);
      var userObj = { _id: user._id, picture: user.picture, displayName: user.displayName };
      var comment = { divesite_id: site._id, user: userObj, text: "blah blah blah" };
      Comment.create(comment, function (err, comment) {
        if (err) {return done(err);}
        done();
      });
    });
  });
}

module.exports = {
  tearDown: tearDown,
  createSiteAndUser: createSiteAndUser,
  createComment: createComment,
  destroyAllComments: destroyAllComments,
  createUser: createUser,
  USERNAME: USERNAME
};
