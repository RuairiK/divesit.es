var loopback = require('loopback');
var ACL = loopback.ACL;

module.exports = function (app) {
  // Override the User model before anything else runs so that we can 
  // manually include the hasMany relation with Dive and Image. See:
  // https://github.com/strongloop/loopback/issues/397
  // We *also* have to manually set up the ACLs for accessing the related
  // models.

  var User = app.models.User;
  var Dive = app.models.Dive;
  var Image = app.models.Image;

  // Add the relations
  User.hasMany(Dive);
  User.hasMany(Image);

  // Manually set up the ACLs. 
  User.settings.acls.push(new ACL({
    accessType: ACL.ALL,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone",
    model: User,
    // Allow GET /api/users/{id}/dives
    property: '__get__dives'
  }),
  new ACL({
    accessType: ACL.ALL,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone",
    model: User,
    // Allow GET /api/users/{id}/images
    property: '__get__images'
  }));
};
