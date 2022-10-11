const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = Schema({
    msg_text: String,
    msg_created_at: String,
    msg_emitter: { type: Schema.ObjectId, ref: 'User'},
    msg_receiver: { type: Schema.ObjectId, ref: 'User'}
});

module.exports = mongoose.model('Message', MessageSchema);