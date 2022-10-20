const Joi = require('joi');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FollowSchema = Schema({
    fw_user: { type: Schema.ObjectId, ref: 'User' },
    fw_followed: { type: Schema.ObjectId, ref: 'User'}
});

const FollowedBodySchema = Joi.object({
    followed: Joi.required()
});

const FollowModel = mongoose.model('Follow', FollowSchema)

module.exports = { FollowModel, FollowedBodySchema };