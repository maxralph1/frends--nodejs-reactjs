const Joi = require('joi');


const getUserFriendsSchema = Joi.object({
    user: Joi.string()
});


module.exports = getUserFriendsSchema;