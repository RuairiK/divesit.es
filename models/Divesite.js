var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.Types.ObjectId;

var DivesiteSchema = new mongoose.Schema({
  name: {type: String, index: 'text', required: true },
  loc: {type: [Number], index: '2dsphere', required: true },
  depth: {type: Number, min: 0, max: 200, required: true },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  boat_entry: { type: Boolean, required: true },
  shore_entry: { type: Boolean, required: true },
  description: { type: String, required: true },
  creator_id: ObjectId
});

module.exports = mongoose.model('Divesite', DivesiteSchema);
