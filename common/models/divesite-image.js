module.exports = function(DivesiteImage) {

  DivesiteImage.validatesPresenceOf('divesiteId', 'userId');

  DivesiteImage.validateAsync('divesiteId', function (err, done) {
    // Check that there is a site with this ID
    var Divesite = DivesiteImage.app.models.Divesite;
    Divesite.findById(this.divesiteId, function (e, site) {
      if (!site) err();
      done();
    });
  });
};
