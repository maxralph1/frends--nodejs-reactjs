const Joi = require('joi');
// const tlds = require('../utils/emailTLDS');


// const validator = (schema) => (payload) => schema.validate(payload, { abortEarly: false });

const registerUserSchema = Joi.object({
    username: Joi.string().alphanum().min(3).max(30).required(),
    email: Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    repeat_password: Joi.ref('password'),
    type: Joi.string().max(30)
});


module.exports = registerUserSchema;
// exports.validateRegister = validator(registerSchema);