const Joi = require('joi');


const deleteUserSchema = Joi.object({
    username: Joi.string()
});


module.exports = deleteUserSchema;