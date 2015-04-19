var mongoose = require('mongoose'),
    User = require('./User'),
    Divesite = require('./Divesite'),
    ObjectId = mongoose.Schema.Types.ObjectId;

var CommentSchema = new mongoose.Schema({
    divesite_id: {
        type: ObjectId,
        ref: 'Divesite',
        required: true,
    },
    user: {
        _id: {
            type: ObjectId,
            ref: 'User',
            required: true
        },
        picture: String,
        displayName: String
    },
    text: {
        type: String,
        required: true
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Comment', CommentSchema);
