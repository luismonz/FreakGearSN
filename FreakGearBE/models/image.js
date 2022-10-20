const Joi = require('joi');

const uploadImageSchema = Joi.object({
    imageFile: Joi.required()
});

module.exports = { uploadImageSchema };