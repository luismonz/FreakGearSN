const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = Schema({
    post_text: String,
    post_file: String,
    post_created_at: String,
    post_user: { type: Schema.ObjectId, ref: 'User' }
});

const PostBodySchema = Joi.object({
    post_text: Joi.string().min(1).max(500).required(),
    post_file: Joi.string(),
    post_created_at: Joi.string()
});

const PatchBodySchema = Joi.object({
    post_text: Joi.string().min(1).max(500),
    post_file: Joi.string()
}).min(1);

const getPaginatedPostsSchema = Joi.object({
    page: Joi.number()
});

const postIdSchema = Joi.object({
    post_id: Joi.string().hex().length(24)
})

const userPostIdSchema = Joi.object({
    user_id: Joi.string().hex().length(24)
})

const PostModel = mongoose.model('Posts', PostSchema)

module.exports = {PostModel, PostBodySchema, getPaginatedPostsSchema, postIdSchema, userPostIdSchema, PatchBodySchema };