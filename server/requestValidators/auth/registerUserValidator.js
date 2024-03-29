const Joi = require('joi');


const registerUserSchema = Joi.object({
    first_name: Joi.string(),
    last_name: Joi.string(),
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2 }),
    // email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    // password: Joi.string(),
    password: Joi.string().pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,24}$')),
    // password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    repeat_password: Joi.ref('password'),
    account_type: Joi.string().max(30)
});


module.exports = registerUserSchema;