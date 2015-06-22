module.exports = function(Divesite) {
  // Set the creating user as the creator of this divesite
  Divesite.beforeRemote('create', function (context, user, next) {
    var req = context.req;
    req.body.userId = req.accessToken.userId;
    next();
  });
};
