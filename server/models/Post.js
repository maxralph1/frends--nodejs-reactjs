const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const postSchema = new Schema({
        body: { type: String, required: true },
        picture_path: String,
        location: String,
        likes: {
            type: Map,
            of: { type: Schema.Types.ObjectId, ref: 'User' }
        },
        comments: {
            type: Array,
            default: []
        },
        user: { type: Schema.Types.ObjectId, ref: 'User', required: true }
    },
    {
        timestamps: { createdAt:'created_at', updatedAt: 'updated_at' }
    }
);


module.exports = mongoose.model('Post', postSchema);