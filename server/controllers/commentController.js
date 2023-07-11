const asyncHandler = require('express-async-handler');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
const getCommentSchema = require('../requestValidators/comments/getCommentValidator');
const getPostSchema = require('../requestValidators/posts/getPostValidator');


/**
 * @apiGroup Comments
 * @apiPermission public
 * @api {get} /api/v1/comments/posts/:post 00. Get All Comments Belonging to a Post
 * @apiName GetComments
 * 
 * @apiDescription This retrieves all comments belonging to a post.
 * 
 * @apiParam {String} post Post's ID.
 *
 * @apiSuccess {String} body    Comment content (message).
 * @apiSuccess {Object} reactions   Reactions on post.
 * @apiSuccess {String} on_post    Post to which comment is added on.
 * @apiSuccess {String} on_user    Post to which comment is added on.
 * @apiSuccess {String} created_by    Author of comment.
 * @apiSuccess {Boolean} deleted     Deletion status of post.
 * @apiSuccess {String} created_at    Date and time of post creation.
 * @apiSuccess {String} updated_at    Date and time of post update.
 * @apiSuccess {String} deleted_at    Date and time of post deletion.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {
 *                  {
 *                      "_id": "641998f45d6408b13cb229b0",
 *                      "body": "lorem ipsum ipsum ipsum",
 *                      "reactions": {"641998f45d6408b13cb229b0", ...},
 *                      "on_post": "641998f45d6408b13cb229b0",
 *                      "on_user": "641998f45d6408b13cb229b0",
 *                      "created_by": "641998f45d6408b13cb229b0",
 *                      "deleted": false,
 *                      "created_at": "2023-07-01T10:59:17.117+00:00"
 *                      "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                      "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                  },
 *                  {
 *                      "_id": "641998f45d6408b13cb229b0",
 *                      "body": "lorem ipsum ipsum ipsum",
 *                      "reactions": {"641998f45d6408b13cb229b0", ...},
 *                      "on_post": "641998f45d6408b13cb229b0",
 *                      "on_user": "641998f45d6408b13cb229b0",
 *                      "created_by": "641998f45d6408b13cb229b0",
 *                      "deleted": false,
 *                      "created_at": "2023-07-01T10:59:17.117+00:00"
 *                      "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                      "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                  }, ...
 *               }
 *     }
 * 
 * @apiError NotFound Possible error message if no comments found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 CommentNotFound
 *     {
 *       "message": "Found no comments belonging to post"
 *     }
 */
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

/**
 * @apiGroup Comments
 * @apiPermission auth
 * @api {post} /api/v1/comments/posts/:post 01. Create New Comment on a Post
 * @apiName CreateNewCommentonPost
 * 
 * @apiDescription This adds a new comment on a post.
 * 
 * @apiParam {String} post Post's ID.
 *
 * @apiBody {String} body     Comment content (body).
 * @apiExample {json} Request Body:
 *     {
 *       "body": "lorem ipsum ipsum ipsum ...",
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 CommentCreated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *               },
 *       "success": "Comment added"
 *     }
 * 
 * @apiError CreateCommentErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed"
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 400 ValidationError
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 401 Unauthenticated
 *     {
 *       "message": "You must be signed in to add a comment to a post. You may wish to sign up for an account, if you do not have one."
 *     }
 */
const commentOnPost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ post: req.params.post, 
                                                            body: req.body.body });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: req.user_id }).exec();
    if (!user) return res.status(401).json({ message: "You must be signed in to add a comment to a post. You may wish to sign up for an account, if you do not have one." });

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
});

/**
 * @apiGroup Comments
 * @apiPermission auth
 * @api {patch} /api/v1/comments/:comment/posts/:post 02. Update Comment Belonging to a Post
 * @apiName UpdateComment
 * 
 * @apiDescription This updates an existing comment.
 * 
 * @apiParam {String} comment Comment's ID.
 * @apiParam {String} post Post's ID.
 * 
 * @apiBody {String} [body]     Comment content (body).
 * @apiExample {json} Request Body:
 *     {
 *       "body": "lorem ipsum ipsum ipsum ...",
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 CommentUpdated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *               },
 *       "success": "Comment updated"
 *     }
 * 
 * @apiError CommentUpdateErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 400 Error
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "message": "You do not have permission to update comments that do not belong to you"
 *     }
 * 
 *     HTTP/1.1 404 CommentNotFound
 *     {
 *       "message": "Comment not found"
 *     }
 */
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

    if (comment.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to update comments that do not belong to you" })

    } else if (comment.created_by == req.user_id) {
        if (validatedData.body) comment.body = validatedData.body;

        comment.save((error) => {
            if (error) {
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({ success: "Comment updated", data: comment });
        });
    }
});

/**
 * @apiGroup Comments
 * @apiPermission auth
 * @api {patch} /api/v1/comments/:comment/reaction 03. React on Comment Belonging to a Post
 * @apiName ReactOnCommentOnPost
 * 
 * @apiParam {String} comment Comment's ID.
 * 
 * @apiDescription This adds/removes reaction from a comment.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 CommentReactedOn
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Comment reacted on"
 *     }
 * 
 * @apiError CommentReactionErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Parameter(s) Validation failed"
 *     }
 * 
 *     HTTP/1.1 400 Error
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 404 CommentNotFound
 *     {
 *       "message": "Comment not found"
 *     }
 */
const reactOnPostComment = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getCommentSchema.validateAsync({ comment: req.params.comment });
    } catch (error) {
        return res.status(400).json({ message: "Parameter validation failed", details: `${error}` });
    }

    const comment = await Comment.findOne({ _id: validatedData.comment }).exec();
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const hasReaction = comment.reactions.get(req.user_id);

    if (!hasReaction) {
        comment.reactions.set(req.user_id, true);
    } else {
        comment.reactions.delete(req.user_id);
    };

    comment.save((error) => {
        if (error) {
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(200).json({ success: "Comment reacted on", data: comment });
    });
});

/**
 * @apiGroup Comments
 * @apiPermission auth
 * @api {put} /api/v1/comments/:comment/posts/:post 04. Soft-Delete Comment Belonging to Post
 * @apiName SoftDeleteCommentonPost
 * 
 * @apiDescription This allows post to be soft-deleted.
 * 
 * @apiParam {String} comment Comment's ID.
 * @apiParam {String} post Post's ID.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 PostUpdated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Comment 641998f45d6408b13cb229b0 deleted"
 *     }
 * 
 * @apiError CommentSoftDeleteErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 400 ValidationError
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "message": "You do not have permission to delete comments that do not belong to you"
 *     }
 * 
 *     HTTP/1.1 404 CommentNotFound
 *     {
 *       "message": "Comment not found"
 *     }
 */
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

    if (commentFound.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to delete comments that do not belong to you" })

    } else if (commentFound.created_by == req.user_id) {

        if (commentFound.deleted == false) {
            commentFound.deleted = true;
            commentFound.deleted_at = new Date().toISOString();
        }

        commentFound.save((error) => {
            if (error) {
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({message: `Comment ${commentFound._id} deleted` });
        });
    }
});

/**
 * @apiGroup Comments
 * @apiPermission auth
 * @api {post} /api/v1/comments/users/:user 05. Create New Comment on a User
 * @apiName CreateNewCommentonUser
 * 
 * @apiDescription This adds a new comment on a user.
 * 
 * @apiParam {String} user User's ID.
 *
 * @apiBody {String} body     Comment content (body).
 * @apiExample {json} Request Body:
 *     {
 *       "body": "lorem ipsum ipsum ipsum ...",
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 CommentCreated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *               },
 *       "success": "Comment added"
 *     }
 * 
 * @apiError CreateCommentErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed"
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 400 ValidationError
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 401 Unauthenticated
 *     {
 *       "message": "You must be signed in to add a comment on a user's profile. You may wish to sign up for an account, if you do not have one."
 *     }
 */
const commentOnUser = asyncHandler(async (req, res) => {
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
});

/**
 * @apiGroup Comments
 * @apiPermission auth
 * @api {patch} /api/v1/comments/:comment/users/:user 06. Update Comment Added About a User
 * @apiName UpdateComment
 * 
 * @apiDescription This updates an existing comment.
 * 
 * @apiParam {String} comment Comment's ID.
 * @apiParam {String} user User's ID.
 * 
 * @apiBody {String} [body]     Comment content (body).
 * @apiExample {json} Request Body:
 *     {
 *       "body": "lorem ipsum ipsum ipsum ...",
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 CommentUpdated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *               },
 *       "success": "Comment updated"
 *     }
 * 
 * @apiError CommentUpdateErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 400 Error
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "message": "You do not have permission to update comments that do not belong to you"
 *     }
 * 
 *     HTTP/1.1 404 CommentNotFound
 *     {
 *       "message": "Comment not found"
 *     }
 */
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

    if (comment.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to update comments that do not belong to you" })

    } else if (comment.created_by == req.user_id) {
        if (validatedData.body) comment.body = validatedData.body;

        comment.save((error) => {
            if (error) {
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({ success: "Comment updated", data: comment });
        });
    }
});

/**
 * @apiGroup Comments
 * @apiPermission auth
 * @api {patch} /api/v1/comments/:comment/reaction 07. React on Comment attributed to a User Profile
 * @apiName ReactOnCommentOnUser
 * 
 * @apiParam {String} comment Comment's ID.
 * 
 * @apiDescription This adds/removes reaction from a comment.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 CommentReactedOn
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Comment reacted on"
 *     }
 * 
 * @apiError CommentReactionErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Parameter(s) Validation failed"
 *     }
 * 
 *     HTTP/1.1 400 Error
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 404 CommentNotFound
 *     {
 *       "message": "Comment not found"
 *     }
 */
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

    const hasReaction = comment.reactions.get(req.user_id);

    if (!hasReaction) {
        comment.reactions.set(req.user_id, true);
    } else {
        comment.reactions.delete(req.user_id);
    };

    comment.save((error) => {
        if (error) {
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(200).json({ success: "Comment reacted on", data: comment });
    });
});

/**
 * @apiGroup Comments
 * @apiPermission auth
 * @api {put} /api/v1/comments/:comment/users/:user 08. Soft-Delete Comment Made on a User Profile
 * @apiName SoftDeleteCommentonUser
 * 
 * @apiDescription This allows user to be soft-deleted.
 * 
 * @apiParam {String} comment Comment's ID.
 * @apiParam {String} user User's ID.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 UserUpdated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Comment 641998f45d6408b13cb229b0 deleted"
 *     }
 * 
 * @apiError CommentSoftDeleteErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 400 ValidationError
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "message": "You do not have permission to delete comments that do not belong to you"
 *     }
 * 
 *     HTTP/1.1 404 CommentNotFound
 *     {
 *       "message": "Comment not found"
 *     }
 */
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

    if (commentFound.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to delete comments that do not belong to you" })

    } else if (commentFound.created_by == req.user_id) {

        if (commentFound.deleted == false) {
            commentFound.deleted = true;
            commentFound.deleted_at = new Date().toISOString();
        }

        commentFound.save((error) => {
            if (error) {
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({message: `Comment deleted` });
        });
    }
});

/**
 * @apiGroup Comments
 * @apiPermission auth, admin
 * @api {put} /api/v1/comments/:comment/undelete 09. Re-activate Soft-Deleted Comment
 * @apiName ReactivateSoftDeletedComment
 * 
 * @apiParam {String} comment Comment's ID.
 * 
 * @apiDescription This allows soft-deleted comment to be re-activated.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 CommentReactivated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Comment 641998f45d6408b13cb229b0 reactivated"
 *     }
 * 
 * @apiError CommentSoftDeleteErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 400 Error
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 404 CommentNotFound
 *     {
 *       "message": "Comment not found"
 *     }
 */
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
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(200).json({message: `Comment ${commentFound._id} reactivated` });
    });
});

/**
 * @apiGroup Comments
 * @apiPermission auth, admin
 * @api {delete} /api/v1/comments/:comment/delete 10. Delete Comment (Permanently)
 * @apiName DeleteComment
 * 
 * @apiParam {String} comment Comment's ID.
 * 
 * @apiDescription This allows for permanent deletion of comment by admin.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 Deleted
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "on_post": "641998f45d6408b13cb229b0",
 *                  "on_user": "641998f45d6408b13cb229b0",
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Comment deleted"
 *     }
 * 
 * @apiError CommentDeleteErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Parameter validation failed",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 400 Error
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 404 CommentNotFound
 *     {
 *       "message": "No comment matches the comment 641998f45d6408b13cb229b0"
 *     }
 */
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
    deleteComment,
}