const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
        username: { type: String, minLength: 3, maxLength: 12, unique: true, required: true },
        first_name: String,
        other_names: String,
        last_name: String,
        email: { type: String, required: true, minLength: 5, maxLength: 45, required: true },
        password: { type: String, required: true },
        picture_path: { type: String, default: '' },
        roles: {
            level1: Number,
            level2: Number,
            level3: Number
    },
        friends: { type: Array, default: [] },
        location: String,
        occupation: String,
        email_verified: Date,
        refresh_token: [ String ],
        password_reset_token: String,
        email_verify_token: String
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


module.exports = mongoose.model("User", userSchema);