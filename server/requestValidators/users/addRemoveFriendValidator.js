const Joi = require('joi');


const addRemoveFriendSchema = Joi.object({
    userId: Joi.string(),
    friendId: Joi.string()
});


module.exports = addRemoveFriendSchema;