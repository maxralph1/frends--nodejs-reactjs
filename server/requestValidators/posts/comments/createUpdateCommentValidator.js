const Joi = require('joi');


const createUpdateCommentSchema = Joi.object({
    body: Joi.string().min(1).max(500).required()
});


module.exports = createUpdateCommentSchema;