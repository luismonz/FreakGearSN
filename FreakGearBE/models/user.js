const Joi = require('joi');
const mongoose = require('mongoose');
const Joigoose = require('joigoose')(mongoose);
const Schema = mongoose.Schema;

const email = Joi.string().email();
const id = Joi.number().integer();
const name_def = Joi.string().max(60);
const password = Joi.string().min(8);
const role = Joi.string().max(20);

const UserJoiSchema = Joi.object({
    user_name: name_def.required(),
    user_surname: name_def,
    user_nickname: name_def.required(),
    user_email: email.required(),
    user_password: password.required(),
    user_role: role.required(),
    user_image: Joi.string().min(0)
});

const UpdateUserJoiSchema = Joi.object({
    user_name: name_def,
    user_surname: name_def,
    user_nickname: name_def,
    user_email: email,
    user_role: role,
    user_image: Joi.string().min(0)
}).min(1);

const UserLoginJoiSchema = Joi.object({
    user_email: email.required(),
    user_password: password.required(),
    getToken: Joi.bool()
});

const getUserSchema = Joi.object({
    user_id: Joi.string().hex().length(24).required()
});

const nonRequiredUserId = Joi.object({
    user_id: Joi.string().hex().length(24)
});

const getPaginatedUsersSchema = Joi.object({
    page: Joi.number()
});

const UserSchema = new Schema(Joigoose.convert(UserJoiSchema));
const UserModel = mongoose.model('User', UserSchema);

module.exports = { UserModel, UserJoiSchema, UserLoginJoiSchema, getUserSchema, getPaginatedUsersSchema, UpdateUserJoiSchema, nonRequiredUserId};