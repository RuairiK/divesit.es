module.exports = function(Image) {

  Image.validatesPresenceOf('divesiteId', 'userId');

  Image.validateAsync('divesiteId', function (err, done) {
    // Check that there is a site with this ID
    var Divesite = Image.app.models.Divesite;
    Divesite.findById(this.divesiteId, function (e, site) {
      if (!site) err();
      done();
    });
  });

  Image.beforeRemote('create', function (context, user, next) {
    // Before saving, set the image's owner to the user sending the request
    var req = context.req;
    req.body.userId = req.accessToken.userId;
    next();
  });

};
