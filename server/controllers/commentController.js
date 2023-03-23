const Comment = require('../models/Comment');
const User = require('../models/User');
const getCommentSchema = require('../requestValidators/comments/getCommentValidator');


const commentOnPost = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ post: req.params.post, 
                                                            body: req.body.body });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: req.user_id }).exec();
    if (!user) return res.status(409).json({ message: "You must be signed in to add a comment to a post. You may wish to sign up for an account, if you do not have one." });

    const addComment = new Comment({
        body: validatedData.body,
        reactions: {},
        on_post: validatedData.post,
        created_by: req.user_id
    });

    addComment.save((error) => {
      if (error) {
        return res.status(400).json({ message: "An error occured", details: `${error}` });
      }
      res.status(201).json({ data: addComment, success: "Comment added" });
    });
}

const updateCommentOnPost = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                            post: req.params.post, 
                                                            body: req.body.body });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const comment = await Comment.findOne({ _id: validatedData.comment, on_post: validatedData.post }).exec();
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to update comments on posts that do not belong to you" })

    } else if (comment.created_by == req.user_id) {
        if (validatedData.body) comment.body = validatedData.body;

        comment.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({ success: "Comment updated", data: comment });
        });
    }
}

const reactOnPostComment = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                            reaction: req.body.reaction });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const comment = await Comment.findOne({ _id: validatedData.comment }).exec();
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const hasReaction = comment.reactions.get(req.user_id);

    if (!hasReaction) {
        comment.reactions.set(req.user_id, validatedData.reaction);
    } else if (hasReaction == validatedData.reaction) {
        comment.reactions.delete(req.user_id);
    } else if (hasReaction != validatedData.reaction) {
        comment.reactions.set(req.user_id, validatedData.reaction);
    }

    comment.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({ success: "Comment reacted on", data: comment });
    });
}

const softDeleteCommentOnPost = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                                post: req.params.post });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const commentFound = await Comment.findOne({ _id: validatedData.comment, on_post: validatedData.post }).exec();
    if (!commentFound) return res.status(404).json({ message: "Comment not found" });

    if (commentFound.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to delete comments that do not belong to you" })

    } else if (commentFound.created_by == req.user_id) {

        if (commentFound.deleted == false) {
            commentFound.deleted = true;
            commentFound.deleted_at = new Date().toISOString();
        }

        commentFound.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({message: `Comment deleted` });
        });
    }
};

const commentOnUser = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ user: req.params.user, 
                                                            body: req.body.body });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: req.user_id }).exec();
    if (!user) return res.status(409).json({ message: "You must be signed in to add a comment on a user's profile. You may wish to sign up for an account, if you do not have one." });

    const addComment = new Comment({
        body: validatedData.body,
        reactions: {},
        on_user: validatedData.user,
        created_by: req.user_id
    });

    addComment.save((error) => {
      if (error) {
        return res.status(400).json({ message: "An error occured", details: `${error}` });
      }
      res.status(201).json({ data: addComment, success: "Comment added" });
    });
}

const updateCommentOnUser = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                            user: req.params.user, 
                                                            body: req.body.body });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const comment = await Comment.findOne({ _id: validatedData.comment, on_user: validatedData.user }).exec();
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to update comments that do not belong to you" })

    } else if (comment.created_by == req.user_id) {
        if (validatedData.body) comment.body = validatedData.body;

        comment.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({ success: "Comment updated", data: comment });
        });
    }
}

const reactOnUserComment = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                            reaction: req.body.reaction });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const comment = await Comment.findOne({ _id: validatedData.comment }).exec();
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const hasReaction = comment.reactions.get(req.user_id);

    if (!hasReaction) {
        comment.reactions.set(req.user_id, validatedData.reaction);
    } else if (hasReaction == validatedData.reaction) {
        comment.reactions.delete(req.user_id);
    } else if (hasReaction != validatedData.reaction) {
        comment.reactions.set(req.user_id, validatedData.reaction);
    }

    comment.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({ success: "Comment reacted on", data: comment });
    });
}

const softDeleteCommentOnUser = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                                user: req.params.user });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const commentFound = await Comment.findOne({ _id: validatedData.comment, on_user: validatedData.user }).exec();
    if (!commentFound) return res.status(404).json({ message: "Comment not found" });

    if (commentFound.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to delete comments that do not belong to you" })

    } else if (commentFound.created_by == req.user_id) {

        if (commentFound.deleted == false) {
            commentFound.deleted = true;
            commentFound.deleted_at = new Date().toISOString();
        }

        commentFound.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({message: `Comment deleted` });
        });
    }
};

const undeleteSoftDeletedComment = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const commentFound = await Comment.findOne({ _id: validatedData.comment }).exec();
    if (!commentFound) return res.status(404).json({ message: "Comment not found" });

    if (commentFound.deleted == true) {
        commentFound.deleted = false; 
        commentFound.deleted_at = ''; 
    }

    commentFound.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({message: `Comment ${commentFound._id} reactivated` });
    });
};

const deleteComment = async (req, res) => {
    if (!req?.params?.comment) return res.status(400).json({ message: "Accurate comment required" });

    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment })
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const comment = await Comment.findOne({ _id: validatedData.comment }).exec();
    if (!comment) {
        return res.status(404).json({ message: `No comment matches the comment ${validatedData.comment}` });
    };
    const deletedComment = await comment.deleteOne();

    res.status(200).json({ data: deletedComment, success: "Comment deleted" })
};


module.exports = {
    commentOnPost,
    updateCommentOnPost,
    reactOnPostComment,  
    softDeleteCommentOnPost,
    commentOnUser,
    updateCommentOnUser, 
    reactOnUserComment, 
    softDeleteCommentOnUser, 
    undeleteSoftDeletedComment, 
    deleteComment
}