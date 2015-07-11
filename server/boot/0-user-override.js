var loopback = require('loopback');
var ACL = loopback.ACL;

module.exports = function (app) {
  // Override the User model before anything else runs so that we can 
  // manually include the hasMany relation with Dive, Image, and Divesite. See:
  // https://github.com/strongloop/loopback/issues/397
  // We *also* have to manually set up the ACLs for accessing the related
  // models. Each one of these appears to need to be done explicitly.

  var User = app.models.User;
  var Dive = app.models.Dive;
  var Divesite = app.models.Divesite;
  var Image = app.models.Image;

  //var keys = Object.keys(User);
  //keys.sort();
  //console.log(keys);
  //console.log(User.isHiddenProperty('password'));
  //console.log(User.settings);
  //console.log(User.definition.properties); // tell me the model properties

  // Setting the 'email' property as protected will hide it from the REST
  // API when the User model is embedded in another model (e.g., Divesite)
  User.settings.protected = User.settings.protected || [];
  User.settings.protected.push('email', 'google', 'facebook');

  // Add the relations
  User.hasMany(Dive);
  User.hasMany(Image);
  User.hasMany(Divesite);

  // Manually set up the ACLs. 
  User.settings.acls.push(new ACL({
    // Allow GET /api/users/{id}/dives
    property: '__get__dives',
    accessType: ACL.READ,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone",
    model: User
  }),
  new ACL({
    // Allow GET /api/users/{id}/images
    property: '__get__images',
    accessType: ACL.READ,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone",
    model: User
  }),
  new ACL({
    // Allow GET /api/users/{id}/divesites
    property: '__get__divesites',
    accessType: ACL.READ,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone",
    model: User
  }),
  new ACL({
    // Allow GET /api/users/{id}/divesites/count
    property: '__count__divesites',
    accessType: ACL.READ,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone"
  }),
  new ACL({
    // Allow GET /api/users/{id}/divesites/{pk}
    property: '__findById__divesites',
    accessType: ACL.READ,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone"
  }),
  new ACL({
    // Allow GET /api/users/{id}/dives/count
    property: '__count__dives',
    accessType: ACL.READ,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone"
  }),
  new ACL({
    // Allow GET /api/users/{id}/dives/{pk}
    property: '__findById__dives',
    accessType: ACL.READ,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone"
  }));

  // Allow read access to User profiles
  User.settings.acls.push(new ACL({
    property: "findById",
    accessType: ACL.READ,
    permission: ACL.ALLOW,
    principalType: ACL.ROLE,
    principalId: "$everyone",
    model: User
  }));

  User.observe('access', function (ctx, next) {
    next();
  });

  User.beforeRemote('findById', function (ctx, instance, next) {
    next();
  });

  User.beforeRemote('**', function (ctx, instance, next) {
    next();
  });

  // FIXME: Currently it's not possible to scrub by whitelisting,
  // so here's a temporary fix using a blacklist.
  User.afterRemote('findById', function (context, instance, next) {
    var blacklistedFields = ['email', 'facebook', 'google', 'password'];
    blacklistedFields.forEach(function (field) {
      instance.unsetAttribute(field);
    });
    next();
  });

};
