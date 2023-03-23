const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const commentSchema = new Schema({
        body: { type: String, maxLength: 150 },
        reactions: {
            type: Map,
            of: String,
        },
        on_post: { type: Schema.Types.ObjectId, ref: 'Post' },
        on_user: { type: Schema.Types.ObjectId, ref: 'User' },
        created_by: { type: Schema.Types.ObjectId, ref: 'User' },
        deleted: Boolean,
        deleted_at: { type: String, default: null }
    },
    {
        timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
    }
);


module.exports = mongoose.model('Comment', commentSchema);
