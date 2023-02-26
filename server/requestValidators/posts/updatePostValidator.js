const Joi = require('joi');


const updatePostSchema = Joi.object({
    body: Joi.string().min(1).max(500).required(),
    location: Joi.string()
});


module.exports = updatePostSchema;