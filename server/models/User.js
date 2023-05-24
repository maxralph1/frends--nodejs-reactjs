const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const userSchema = new Schema({
        username: { type: String, minLength: 3, maxLength: 12, unique: true, required: true },
        first_name: String,
        other_names: String,
        last_name: String,
        email: { type: String, required: true, minLength: 5, maxLength: 45, required: true },
        password: { type: String, required: true },
        // picture_path: { 
        //     public_id: { type: String, default: '' },
        //     url: { type: String, default: '' }
        // },
        profile_image: { 
            public_id: { type: String, default: '' },
            url: { type: String, default: '' }
        },
        wallpaper_image: { 
            public_id: { type: String, default: '' },
            url: { type: String, default: '' }
        },
        roles: { type: [String], default: ['level1'] },
        verified: { type: Boolean, default: false },
        friends: { type: Array, default: [] },
        location: String,
        occupation: String,
        email_verified: Date, 
        online: { type: Boolean, default: false },
        last_time_active: String,
        show_friends: { type: Boolean, default: true },
        followers: {
            type: Map,
            of: Boolean,
            default: {}
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

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}


module.exports = mongoose.model("User", userSchema);