const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowSchema = Schema({
    fw_user: { type: Schema.ObjectId, ref: 'User' },
    fw_followed: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Follow', FollowSchema);