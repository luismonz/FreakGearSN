const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = Schema({
    post_text: String,
    post_file: String,
    post_created_at: String,
    post_user: { type: Schema.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Post', PostSchema);