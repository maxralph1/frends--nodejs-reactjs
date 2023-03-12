const Joi = require('joi');


const softDeletePostSchema = Joi.object({
    post: Joi.string()
});


module.exports = softDeletePostSchema;