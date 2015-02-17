var mongoose = require('mongoose');

var DivesiteSchema = new mongoose.Schema({
	name: String,
	lat: String,
	lon: String,
	chart_depth: {type: Number, min: 0, max: 200},
	type: String,
	updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Divesite', DivesiteSchema);