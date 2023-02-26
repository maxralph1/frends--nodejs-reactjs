const Joi = require('joi');


const createUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    first_name: Joi.string().min(1).max(30).required(),
    other_names: Joi.string().min(1).max(30),
    last_name: Joi.string().min(1).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    repeat_password: Joi.ref('password'),
    type: Joi.string().max(30),
    location: Joi.string().max(100)
});


module.exports = createUserSchema;