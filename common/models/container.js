module.exports = function(Container) {

  Container.afterRemote('create', function (context, instance, next) {
    next();
  });

  Container.beforeRemote('upload', function (ctx, instance, next) {
    // Require a 'divesite' header
    if (!ctx.req.headers.divesite) {
      return ctx.res.status(422).json(new Error("You need a divesite ID"));
    }
    // Insert the requesting user's ID as a header
    ctx.req.headers.userId = ctx.req.accessToken.userId;
    next();
  });

  Container.afterRemote('upload', function (ctx, instance, next) {
    // Retrieve the container and filename from the instance
    var container = instance.result.files.image[0].container;
    var filename = instance.result.files.image[0].name;
    // FIXME: This probably doesn't need to be inside a call to
    // Container.getFile
    Container.getFile(container, filename, function (err, res) {
      var Image = Container.app.models.Image;
      // FIXME: This is unlikely to be consistent across storage providers
      var url = "/api/storage/" + container + "/" + filename;
      // Create an associated Image object
      Image.create({
        url: url,
        userId: ctx.req.headers.userId,
        divesiteId: ctx.req.headers.divesite
      }, next);
    });
  });

};
