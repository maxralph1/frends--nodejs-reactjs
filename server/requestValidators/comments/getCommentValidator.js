const Joi = require('joi');


const getCommentSchema = Joi.object({
    // params
    comment: Joi.string(),
    post: Joi.string(),
    user: Joi.string(),

    // body
    body: Joi.string(),
    // body: Joi.string().min(1).max(500).required(),
    reaction: Joi.string().valid("like", "love", "smile", "laugh", "sad", "angry")
});


module.exports = getCommentSchema;