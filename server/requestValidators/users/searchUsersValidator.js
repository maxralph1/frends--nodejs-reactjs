const Joi = require('joi');


const searchUsersSchema = Joi.object({
    searchKey: Joi.string()
});


module.exports = searchUsersSchema;