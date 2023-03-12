const Joi = require('joi');


const deletePostSchema = Joi.object({
    id: Joi.string()
});


module.exports = deletePostSchema;