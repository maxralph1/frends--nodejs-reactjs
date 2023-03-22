const Joi = require('joi');


const updatePostSchema = Joi.object({
    // param
    post: Joi.string(),
    // body
    body: Joi.string(),
    location: Joi.string()
});


module.exports = updatePostSchema;