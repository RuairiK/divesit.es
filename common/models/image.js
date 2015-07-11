module.exports = function(Image) {

  Image.validatesPresenceOf('userId');


  Image.beforeRemote('create', function (context, user, next) {
    // Before saving, set the image's owner to the user sending the request
    var req = context.req;
    req.body.userId = req.accessToken.userId;
    next();
  });

};
