var mongoose = require('mongoose');

var DivesiteSchema = new mongoose.Schema({
	name: String,
  loc: {loc: {type: [Number], index: '2dsphere'}},
	chart_depth: {type: Number, min: 0, max: 200},
	updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Divesite', DivesiteSchema);
