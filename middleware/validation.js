var mongoose = require('mongoose');
var HTTP = require('http-status-codes');

function isValidObjectID(_id) {
  return _id && mongoose.Types.ObjectId.isValid(_id);
}


function hasValidIdOr404(req, res, next) {
  if (!isValidObjectID(req.params.id)) {
    return res.status(HTTP.NOT_FOUND).json({});
  }
  next();
}

// If given an 'id' parameter in the request, find an object of model 'model'
// and add it to the request object, returning HTTP 404 if no such object
// exists
function findObjectOr404(model) {
  return function (req, res, next) {
    model.findOne({_id: req.params.id}, function (err, obj) {
      if (err) return next(err);
      if (!obj) {
        return res.status(HTTP.NOT_FOUND).json({});
      }
      req.obj = obj;
      next();
    });
  };
};

module.exports = {
  hasValidIdOr404: hasValidIdOr404,
  findObjectOr404: findObjectOr404
};
