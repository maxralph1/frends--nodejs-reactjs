const Joi = require('joi');


const createPostSchema = Joi.object({
    body: Joi.string().min(1).max(500).required(),
    image: Joi.string(),
    location: Joi.string()
});


module.exports = createPostSchema;