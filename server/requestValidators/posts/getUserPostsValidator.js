const Joi = require('joi');


const getUserPostsSchema = Joi.object({
    username: Joi.string()
});


module.exports = getUserPostsSchema;