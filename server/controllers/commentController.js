const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const getCommentSchema = require('../requestValidators/comments/getCommentValidator');
const getPostSchema = require('../requestValidators/posts/getPostValidator');


// @desc   Get all comments belonging to a post
// @route  GET /api/v1/comments/posts/:post
// @access Public
const getCommentsOnPost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getPostSchema.validateAsync({ post: req.params.post })
    } catch (error) {
        return res.status(400).json({ message: "Post key validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ on_post: validatedData.post }).exec();
    if (!post) return res.status(404).json({ message: "Post does not exist." });

    const comments = await Comment.find({ on_post: post._id });
    if (!comments?.length) return res.status(404).json({ message: "Found no comments belonging to post" });

    res.status(200).json({ data: comments });
});

// @desc   Comment on a post
// @route  POST /api/v1/comments/posts/:post
// @access Private
const commentOnPost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ post: req.params.post, 
                                                            body: req.body.body });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: req.user._id }).exec();
    if (!user) return res.status(409).json({ message: "You must be signed in to add a comment to a post. You may wish to sign up for an account, if you do not have one." });

    const addComment = new Comment({
        body: validatedData.body,
        reactions: {},
        on_post: validatedData.post,
        created_by: req.user._id
    });

    addComment.save((error) => {
      if (error) {
        return res.status(400).json({ message: "An error occured", details: `${error}` });
      }
      res.status(201).json({ data: addComment, success: "Comment added" });
    });
});

// @desc   Update comment on a post
// @route  PATCH /api/v1/comments/:comment/posts/:post
// @access Private
const updateCommentOnPost = asyncHandler(async (req, res) => {
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

    if (comment.created_by != req.user._id) {
        res.status(403).json({ message: "You do not have permission to update comments on posts that do not belong to you" })

    } else if (comment.created_by == req.user._id) {
        if (validatedData.body) comment.body = validatedData.body;

        comment.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({ success: "Comment updated", data: comment });
        });
    }
});

// @desc   React on comment on a post
// @route  PATCH /api/v1/comments/:comment/reaction
// @access Private
const reactOnPostComment = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                            reaction: req.body.reaction });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const comment = await Comment.findOne({ _id: validatedData.comment }).exec();
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const hasReaction = comment.reactions.get(req.user._id);

    if (!hasReaction) {
        comment.reactions.set(req.user._id, validatedData.reaction);
    } else if (hasReaction == validatedData.reaction) {
        comment.reactions.delete(req.user._id);
    } else if (hasReaction != validatedData.reaction) {
        comment.reactions.set(req.user._id, validatedData.reaction);
    }

    comment.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({ success: "Comment reacted on", data: comment });
    });
});

// @desc   Soft-delete comment on a post
// @route  PUT /api/v1/comments/:comment/posts/:post
// @access Private
const softDeleteCommentOnPost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                                post: req.params.post });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const commentFound = await Comment.findOne({ _id: validatedData.comment, on_post: validatedData.post }).exec();
    if (!commentFound) return res.status(404).json({ message: "Comment not found" });

    if (commentFound.created_by != req.user._id) {
        res.status(403).json({ message: "You do not have permission to delete comments that do not belong to you" })

    } else if (commentFound.created_by == req.user._id) {

        if (commentFound.deleted == false) {
            commentFound.deleted = true;
            commentFound.deleted_at = new Date().toISOString();
        }

        commentFound.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({ success: `Comment deleted`, data: commentFound });
        });
    }
});

// @desc   Comment on user profile
// @route  POST /api/v1/comments/users/:user
// @access Private
const commentOnUser = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ user: req.params.user, 
                                                            body: req.body.body });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: req.user._id }).exec();
    if (!user) return res.status(409).json({ message: "You must be signed in to add a comment on a user's profile. You may wish to sign up for an account, if you do not have one." });

    const addComment = new Comment({
        body: validatedData.body,
        reactions: {},
        on_user: validatedData.user,
        created_by: req.user._id
    });

    addComment.save((error) => {
      if (error) {
        return res.status(400).json({ message: "An error occured", details: `${error}` });
      }
      res.status(201).json({ data: addComment, success: "Comment added" });
    });
});

// @desc   Update comment on user profile
// @route  PATCH /api/v1/comments/:comment/users/:user
// @access Private
const updateCommentOnUser = asyncHandler(async (req, res) => {
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

    if (comment.created_by != req.user._id) {
        res.status(403).json({ message: "You do not have permission to update comments that do not belong to you" })

    } else if (comment.created_by == req.user._id) {
        if (validatedData.body) comment.body = validatedData.body;

        comment.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({ success: "Comment updated", data: comment });
        });
    }
});

// @desc   React on comment on user profile
// @route  PUT /api/v1/comments/:comment/reaction
// @access Private
const reactOnUserComment = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                            reaction: req.body.reaction });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const comment = await Comment.findOne({ _id: validatedData.comment }).exec();
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const hasReaction = comment.reactions.get(req.user._id);

    if (!hasReaction) {
        comment.reactions.set(req.user._id, validatedData.reaction);
    } else if (hasReaction == validatedData.reaction) {
        comment.reactions.delete(req.user._id);
    } else if (hasReaction != validatedData.reaction) {
        comment.reactions.set(req.user._id, validatedData.reaction);
    }

    comment.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({ success: "Comment reacted on", data: comment });
    });
});

// @desc   Soft-delete comment on user profile
// @route  PUT /api/v1/comments/:comment/users/:user
// @access Private
const softDeleteCommentOnUser = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment, 
                                                                user: req.params.user });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const commentFound = await Comment.findOne({ _id: validatedData.comment, on_user: validatedData.user }).exec();
    if (!commentFound) return res.status(404).json({ message: "Comment not found" });

    if (commentFound.created_by != req.user._id) {
        res.status(403).json({ message: "You do not have permission to delete comments that do not belong to you" })

    } else if (commentFound.created_by == req.user._id) {

        if (commentFound.deleted == false) {
            commentFound.deleted = true;
            commentFound.deleted_at = new Date().toISOString();
        }

        commentFound.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({ success: `Comment deleted` });
        });
    }
});

// @desc   Re-activate soft-deleted comment
// @route  PUT /api/v1/comments/:comment/undelete
// @access Private
const undeleteSoftDeletedComment = asyncHandler(async (req, res) => {
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
});

// @desc   Delete comment (Admin access)
// @route  DELETE /api/v1/comments/:comment/delete
// @access Private
const deleteComment = asyncHandler(async (req, res) => {
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
});


module.exports = {
    getCommentsOnPost, 
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