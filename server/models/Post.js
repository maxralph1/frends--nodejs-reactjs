const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const postSchema = new Schema({
        body: { type: String },
        picture_paths: { type: [String], default: '' },
        location: String,
        reactions: {
            type: Map,
            of: String,
        },
        created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        deleted: Boolean,
        deleted_at: { type: String, default: null }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


module.exports = mongoose.model('Post', postSchema);