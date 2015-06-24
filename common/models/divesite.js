module.exports = function(Divesite) {
  // Set the creating user as the creator of this divesite
  Divesite.beforeRemote('create', function (context, user, next) {
    var req = context.req;
    req.body.userId = req.accessToken.userId;
    next();
  });
  // Only update allowed fields
  Divesite.beforeRemote('prototype.updateAttributes', function (context, user, next) {
    // These are the names of the allowed fields; everything else gets deleted
    var whitelistedProperties = [
      'name', 'loc', 'depth', 'boatEntry', 'shoreEntry', 'description', 'minimumLevel'
    ];
    Object.keys(context.req.body).forEach(function (key) {
      if (whitelistedProperties.indexOf(key) < 0) {
        delete context.req.body[key];
      }
    });
    next();
  });
};
