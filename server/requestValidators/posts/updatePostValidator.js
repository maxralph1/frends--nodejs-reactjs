const Joi = require('joi');


const updatePostSchema = Joi.object({
    // param
    id: Joi.string(),
    // body
    body: Joi.string().min(1).max(500).required(),
    location: Joi.string()
});


module.exports = updatePostSchema;