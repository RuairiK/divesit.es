module.exports = function(Dive) {

  Dive.beforeRemote('create', function (context, user, next) {
    // Set the requesting user as the creator of this divesite
    var req = context.req;
    req.body.userId = req.accessToken.userId;
    next();
  });

};
