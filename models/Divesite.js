var mongoose = require('mongoose'),
    ObjectId = mongoose.Schema.Types.ObjectId;

/* valid categories */
var categories = ['wreck', 'scenic', 'drift'];  

var DivesiteSchema = new mongoose.Schema({
	name: {type: String, index: 'text'},
  loc: {type: [Number], index: '2dsphere'},
	chart_depth: {type: Number, min: 0, max: 200},
  created_at: { type: Date, default: Date.now },
	updated_at: { type: Date, default: Date.now },
  description: String,
  category: {type: String, enum: categories},
  creator_id: ObjectId
});

module.exports = mongoose.model('Divesite', DivesiteSchema);
