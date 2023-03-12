const Joi = require('joi');


const getUserSchema = Joi.object({
    username: Joi.string()
});


module.exports = getUserSchema;