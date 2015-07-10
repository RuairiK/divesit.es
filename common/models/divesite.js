module.exports = function(Divesite) {

  Divesite.beforeRemote('create', function (context, user, next) {
    // Set the requesting user as the creator of this divesite
    var req = context.req;
    req.body.userId = req.accessToken.userId;
    next();
  });

  Divesite.beforeRemote('**', function (ctx, inst, next) {
    /* If there is a requesting user, then add their userId to the request body */
    //console.log('Divesite::' + context.methodString);
    console.info('DIVESITE REMOTEMETHOD: Divesite::' + ctx.methodString);
    if (ctx.req.accessToken) {
      ctx.req.body.userId = ctx.req.accessToken.userId;
      console.info('  Added user ID ' + ctx.req.body.userId);
    } else {
      console.info('  No accessToken');
    }
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
