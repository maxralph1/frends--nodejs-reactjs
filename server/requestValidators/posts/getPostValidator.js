const Joi = require('joi');


const getPostSchema = Joi.object({
    post: Joi.string()
});


module.exports = getPostSchema;