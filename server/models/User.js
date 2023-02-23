const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
    username: { type: String, minLength: 3, maxLength: 12, unique: true, required: true },
    email: String,
    password: { type: String, required: true },
    roles: {
        level1: { type: Number, default: 1000},
        level2: Number,
        level3: Number
    },
    email_verified: Date,
    refresh_token: [String],
    password_reset_token: String,
    email_verify_token: String
});


module.exports = mongoose.model("User", userSchema);