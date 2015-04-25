var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var DivesiteSchema = new mongoose.Schema({
	name: String,
  loc: {type: [Number], index: '2dsphere'},
	chart_depth: {type: Number, min: 0, max: 200},
	updated_at: { type: Date, default: Date.now },
  description: String,
  category: String,
  creator_id: ObjectId
});

module.exports = mongoose.model('Divesite', DivesiteSchema);
