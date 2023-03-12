const Joi = require('joi');


const softDeleteUserSchema = Joi.object({
    username: Joi.string()
});


module.exports = softDeleteUserSchema;