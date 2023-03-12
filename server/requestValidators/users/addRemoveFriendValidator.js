const Joi = require('joi');


const addRemoveFriendSchema = Joi.object({
    id: Joi.string(),
    friendId: Joi.string()
});


module.exports = addRemoveFriendSchema;