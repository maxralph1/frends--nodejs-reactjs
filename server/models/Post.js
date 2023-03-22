const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
        body: { type: String },
        picture_paths: { type: [String], default: '' },
        location: String,
        // likes: {
        //     type: Map,
        //     of: Boolean,
        //     by: { type: Schema.Types.ObjectId, ref: 'User' }
        // },
        likes: {
            type: Map,
            of: Boolean,
        },
        // comments: {
        //     type: Array,
        //     default: []
        // },
        comments: {
            type: Map,
            of: String,
            by: { type: Schema.Types.ObjectId, ref: 'User' }
        },
        created_by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        deleted: Boolean,
        soft_deleted: { type: String, default: null }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);

module.exports = mongoose.model('Post', postSchema);