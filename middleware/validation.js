var mongoose = require('mongoose');
var HTTP = require('http-status-codes');

// Check that _id is defined and that it's a valid Mongoose
// ID (26 char alphanumeric)
function isValidObjectID(_id) {
  return _id && mongoose.Types.ObjectId.isValid(_id);
}

function validateBounds(_bounds) {
  if (!_bounds) return false; // validate existence
  var bounds = _bounds.toString().split(',');
  if (bounds.length != 4) return false; // validate length
  if (bounds[0] == bounds[2] && bounds[1] == bounds[3]) return false;
  return bounds.every(function (b) {return !isNaN(b)});
}


// Check the incoming request for a valid ID; if none is
// found, then return 404
function hasValidIdOr404(req, res, next) {
  if (!isValidObjectID(req.params.id)) {
    return res.status(HTTP.NOT_FOUND).json({});
  }
  next();
}

// If given an 'id' parameter in the request, find an object of model 'model'
// and add it to the request object as the 'obj' property, returning HTTP 404 if no such object
// exists
function findObjectOr404(model) {
  return function (req, res, next) {
    model.findOne({_id: req.params.id}, function (err, obj) {
      if (err) return next(err);
      // If no object, then return 404
      if (!obj) return res.status(HTTP.NOT_FOUND).json({});
      // Otherwise modify the request object
      req.obj = obj;
      next();
    });
  };
};

module.exports = {
  hasValidIdOr404: hasValidIdOr404,
  findObjectOr404: findObjectOr404,
  validateBounds: validateBounds
};

