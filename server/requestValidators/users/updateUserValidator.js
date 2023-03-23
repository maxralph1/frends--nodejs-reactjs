const Joi = require('joi');


const updateUserSchema = Joi.object({
    // param
    user: Joi.string(),
    // body
    username: Joi.string().alphanum().min(3).max(30),
    first_name: Joi.string().min(1).max(30),
    other_names: Joi.string().min(1).max(30),
    last_name: Joi.string().min(1).max(30),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    repeat_password: Joi.ref('password'),
    account_type: Joi.string().max(40),
    verified: Joi.string(),
    friends: Joi.string().max(30),
    location: Joi.string().max(100),
    occupation: Joi.string().max(100),
    email_verified: Joi.string().max(100),
    show_friends: Joi.string(),
    active: Joi.string(),
    deleted_at: Joi.string().max(30)
});


module.exports = updateUserSchema;