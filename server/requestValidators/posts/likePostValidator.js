const Joi = require('joi');


const likePostSchema = Joi.object({
    id: Joi.string()
});


module.exports = likePostSchema;