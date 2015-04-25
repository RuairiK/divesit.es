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

module.exports = {
  hasValidIdOr404: hasValidIdOr404
}
