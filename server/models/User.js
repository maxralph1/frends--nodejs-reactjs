const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
        username: { type: String, minLength: 3, maxLength: 12, unique: true, required: true },
        first_name: String,
        other_names: String,
        last_name: String,
        email: { type: String, required: true, minLength: 5, maxLength: 45, required: true },
        password: { type: String, required: true },
        picture_path: { 
            public_id: { type: String, default: '' },
            url: { type: String, default: '' }
        },
        roles: { type: [String], default: ['level1'] },
        verified: { type: Boolean, default: false },
        friends: { type: Array, default: [] },
        location: String,
        occupation: String,
        email_verified: Date,
        last_time_active: {type: Date, default: Date.now},
        show_friends: { type: Boolean, default: true },
        followers: {
            type: Map,
            of: Boolean,
        },
        password_reset_token: String,
        email_verify_token: String,
        created_by: { type: Schema.Types.ObjectId, ref: 'User' },
        active: { type: Boolean, default: true },
        deleted_at: { type: String, default: null }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


module.exports = mongoose.model("User", userSchema);