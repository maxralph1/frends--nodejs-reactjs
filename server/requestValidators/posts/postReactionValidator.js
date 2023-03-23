const Joi = require('joi');


const postReactionSchema = Joi.object({
    // params
    post: Joi.string(),
    // body
    reaction: Joi.string().valid("like", "love", "smile", "laugh", "sad", "angry")
});


module.exports = postReactionSchema;