var Divesite = require.main.require('models/Divesite');
var User = require.main.require('models/User');
var Comment = require.main.require('models/Comment');

function tearDown () {
  User.find().remove().exec();
  Divesite.find().remove().exec();
  Comment.find().remove().exec();
}

var USERNAME = 'TEST_USER';

function createSiteAndUser (done) {
  var newSite = {
    name: "TEST_DIVESITE",
    category: "wreck",
    chart_depth: 100,
    loc: [0, 0]
  };
  Divesite.create(newSite, function (err, site) {
    if (err) return done(err);
    //console.log("created a site");
    User.create({displayName: USERNAME, picture: 'http://example.com/example.png'}, function (err, user) {
      if (err) return done(err);
      //console.log("created a user");
      done();
    });
  });
}

function destroyAllComments (done) {
  Comment.find().remove(done);
}

module.exports = {
  tearDown: tearDown,
  createSiteAndUser: createSiteAndUser,
  destroyAllComments: destroyAllComments,
  USERNAME: USERNAME
};
