const Joi = require('joi');


const createUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    first_name: Joi.string().min(1).max(30).required(),
    other_names: Joi.string().min(1).max(30),
    last_name: Joi.string().min(1).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: true } }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    repeat_password: Joi.ref('password'),
    account_type: Joi.string().max(35),
    // profile_photo: Joi.string(),
    verified: Joi.string(),
    location: Joi.string().max(100),
    occupation: Joi.string().max(100),
    email_verified: Joi.string().max(100),
    show_friends: Joi.string(),
    active: Joi.string(),
    user_id: Joi.string(),
});


module.exports = createUserSchema;