const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    username: { type: String, minLength: 3, maxLength: 12, unique: true, required: true },
    password: String,
    refresh_token: String
});


module.exports = mongoose.model("User", userSchema);