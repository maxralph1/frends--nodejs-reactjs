const Joi = require('joi');


const postReactionSchema = Joi.object({
    // param
    post: Joi.string()
});


module.exports = postReactionSchema;