const asyncHandler = require('express-async-handler');
const cloudinaryImageUpload = require('../config/imageUpload/cloudinary');
const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const getPostSchema = require('../requestValidators/posts/getPostValidator');
const getUserSchema = require('../requestValidators/users/getUserValidator');
const createPostSchema = require('../requestValidators/posts/createPostValidator');
const updatePostSchema = require('../requestValidators/posts/updatePostValidator');
const postReactionSchema = require('../requestValidators/posts/postReactionValidator');


/**
 * @apiGroup Posts
 * @apiPermission public
 * @api {get} /api/v1/posts 00. Get All Posts
 * @apiName GetPosts
 * 
 * @apiDescription This retrieves all posts.
 *
 * @apiSuccess {String} body    Post content (message).
 * @apiSuccess {Object} picture_paths   Post picture information.
 * @apiSuccess {String} location   Post location.
 * @apiSuccess {Object} reactions   Reactions on post.
 * @apiSuccess {String} created_by    Author of post.
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
 *                      "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                      "location": "123 John Snow Street, New York",
 *                      "reactions": {"641998f45d6408b13cb229b0", ...},
 *                      "created_by": "641998f45d6408b13cb229b0",
 *                      "deleted": false,
 *                      "created_at": "2023-07-01T10:59:17.117+00:00"
 *                      "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                      "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                  },
 *                  {
 *                      "_id": "641998f45d6408b13cb229b0",
 *                      "body": "lorem ipsum ipsum ipsum",
 *                      "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                      "location": "123 John Snow Street, New York",
 *                      "reactions": {"641998f45d6408b13cb229b0", ...},
 *                      "created_by": "641998f45d6408b13cb229b0",
 *                      "deleted": false,
 *                      "created_at": "2023-07-01T10:59:17.117+00:00"
 *                      "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                      "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                  }, ...
 *               }
 *     }
 * 
 * @apiError NotFound Possible error message if no posts found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "No Posts found"
 *     }
 */
const getAllPosts = asyncHandler(async (req, res) => {
    const posts = await Post.find().sort('-created_at').lean();
    if (!posts?.length) return res.status(404).json({ message: "No posts found" });

    res.status(200).json({ data: posts });
});

// @desc   Get all posts
// @route  GET /api/v1/posts
// @access Public
// const getAllPosts = asyncHandler(async (req, res) => {
//     const pageSize = process.env.PAGINATION_LIMIT;
//     const page = Number(req.query.pageNumber) || 1;

//     const posts = await Post.find()
//         .limit(pageSize)
//         .skip(pageSize * (page - 1))
//         .sort('-created_at')
//         .lean();

//     if (!posts?.length) return res.status(404).json({ message: "No posts found" });

//     res.status(200).json({ data: posts, page, pages: Math.ceil(count / pageSize) });
// });

/**
 * @apiGroup Posts
 * @apiPermission public
 * @api {get} /api/v1/posts/:post 01. Get Post
 * @apiName GetPost
 * 
 * @apiParam {String} post Post's ID.
 * 
 * @apiDescription This retrieves post based on the :post parameter.
 *
 * @apiSuccess {String} body    Post content (message).
 * @apiSuccess {Object} picture_paths   Post picture information.
 * @apiSuccess {String} location   Post location.
 * @apiSuccess {Object} reactions   Reactions on post.
 * @apiSuccess {String} created_by    Author of post.
 * @apiSuccess {Boolean} deleted     Deletion status of post.
 * @apiSuccess {String} created_at    Date and time of post creation.
 * @apiSuccess {String} updated_at    Date and time of post update.
 * @apiSuccess {String} deleted_at    Date and time of post deletion.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                  "location": "123 John Snow Street, New York",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00",
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00",
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *               }
 *     }
 * 
 * @apiError NotFound Possible error message if no matching post found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 NotFound
 *     {
 *       "message": "No Post matches post 641998f45d6408b13cb229b0"
 *     }
 */
const getPost = asyncHandler(async (req, res) => {
    if (!req?.params?.post) return res.status(400).json({ message: "Post required" });

    let validatedData;
    try {
        validatedData = await getPostSchema.validateAsync({ post: req.params.post })
    } catch (error) {
        return res.status(400).json({ message: "Post key validation failed", details: `${error}` });
    }

    const postFound = await Post.findOne({ _id: validatedData.post }).exec();
    if (!postFound) {
        return res.status(404).json({ message: `No post matches ${validatedData.post}` });
    }

    res.status(200).json({ data: postFound });
});

/**
 * @apiGroup Posts
 * @apiPermission auth
 * @api {get} /api/v1/posts/my-posts 02. Get All Currently Authenticated User Posts
 * @apiName GetAuthUserPosts
 * 
 * @apiDescription This retrieves all current authenticated user's posts.
 *
 * @apiSuccess {String} _id Post ID.
 * @apiSuccess {String} body    Post content (message).
 * @apiSuccess {Object} picture_paths   Post picture information.
 * @apiSuccess {String} location   Post location.
 * @apiSuccess {Object} reactions   Reactions on post.
 * @apiSuccess {String} created_by    Author of post.
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
 *                      "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                      "location": "123 John Snow Street, New York",
 *                      "reactions": {"641998f45d6408b13cb229b0", ...},
 *                      "created_by": "641998f45d6408b13cb229b0",
 *                      "deleted": false,
 *                      "created_at": "2023-07-01T10:59:17.117+00:00"
 *                      "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                      "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                  },
 *                  {
 *                      "_id": "641998f45d6408b13cb229b0",
 *                      "body": "lorem ipsum ipsum ipsum",
 *                      "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                      "location": "123 John Snow Street, New York",
 *                      "reactions": {"641998f45d6408b13cb229b0", ...},
 *                      "created_by": "641998f45d6408b13cb229b0",
 *                      "deleted": false,
 *                      "created_at": "2023-07-01T10:59:17.117+00:00"
 *                      "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                      "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                  }, ...
 *               }
 *     }
 * 
 * @apiError AuthUserPostsErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Unauthenticated
 *     {
 *       "message": "You are not logged in. You can only access logged in user's posts if you own those posts. Otherwise, you may wish to log in to view your posts or go to the post feeds for random posts"
 *     }
 * 
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "No Posts found"
 *     }
 */
const getAuthUserPosts = asyncHandler(async (req, res) => {
    if (!req.user_id) {
        return res.status(401).json({ message: "You are not logged in. You can only access logged in user's posts if you own those posts. Otherwise, you may wish to log in to view your posts or go to the post feeds for random posts" })

    } else if (req.user_id) {
        const posts = await Post.find({ created_by: req.user_id })
            .select(['-password', '-email_verified', '-deleted_at', '-active', '-created_by', '-created_at', '-updated_at'])
            .lean();

        if (!posts?.length) {
            return res.status(404).json({ message: "You have no posts yet" })
        }
        res.status(200).json({ data: posts });
    }
});

/**
 * @apiGroup Posts
 * @apiPermission public
 * @api {get} /api/v1/posts/user/:user 03. Get Posts Belonging to User
 * @apiName GetUserPosts
 * 
 * @apiParam {String} user User's IDs.
 * 
 * @apiDescription This retrieves all posts belonging to user.
 *
 * @apiSuccess {String} body    Post content (message).
 * @apiSuccess {Object} picture_paths   Post picture information.
 * @apiSuccess {String} location   Post location.
 * @apiSuccess {Object} reactions   Reactions on post.
 * @apiSuccess {String} created_by    Author of post.
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
 *                      "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                      "location": "123 John Snow Street, New York",
 *                      "reactions": {"641998f45d6408b13cb229b0", ...},
 *                      "created_by": "641998f45d6408b13cb229b0",
 *                      "deleted": false,
 *                      "created_at": "2023-07-01T10:59:17.117+00:00"
 *                      "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                      "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                  },
 *                  {
 *                      "_id": "641998f45d6408b13cb229b0",
 *                      "body": "lorem ipsum ipsum ipsum",
 *                      "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                      "location": "123 John Snow Street, New York",
 *                      "reactions": {"641998f45d6408b13cb229b0", ...},
 *                      "created_by": "641998f45d6408b13cb229b0",
 *                      "deleted": false,
 *                      "created_at": "2023-07-01T10:59:17.117+00:00"
 *                      "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                      "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                  }, ...
 *               }
 *     }
 * 
 * @apiError UserPostsErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Post parameter validation failed",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "Found no posts belonging to user"
 *     }
 */
const getUserPosts = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user })
    } catch (error) {
        return res.status(400).json({ message: "Post parameter validation failed", details: `${error}` });
    }

    const user = await User.findOne({ username: validatedData.user }).exec();
    if (!user) return res.status(404).json({ message: "User does not exist. Perhaps, you should search by their names or other identification markers to see if you could find the user you are looking for." });

    const posts = await Post.find({ user: user._id });
    if (!posts?.length) return res.status(404).json({ message: "Found no posts belonging to user" });

    res.status(200).json({ data: posts });s
});

/**
 * @apiGroup Posts
 * @apiPermission auth
 * @api {post} /api/v1/posts 04. Create New Post
 * @apiName CreateNewPost
 * 
 * @apiDescription This creates a new post.
 *
 * @apiBody {String} body     Post content (body).
 * @apiBody {String} location       Location on the post.
 * @apiBody {Image} [post_photos]       Post images.
 * @apiExample {json} Request Body:
 *     {
 *       "body": "lorem ipsum ipsum ipsum ...",
 *       "location": "123 John Snow Street, New York",
 *       "post_photos": (image file), ...
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 PostCreated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                  "location": "123 John Snow Street, New York",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *               },
 *       "success": "User added"
 *     }
 * 
 * @apiError CreatePostErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed"
 *     }
 * 
 *     HTTP/1.1 400 ValidationError
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 400 ImageUploadFailed
 *     {
 *       "message": "Image upload failed"
 *     }
 * 
 *     HTTP/1.1 403 Unauthenticated
 *     {
 *       "message": "You must be signed in to add a post. You may sign up for an account, if you do not have one."
 *     }
 */
const createPost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await createPostSchema.validateAsync({ body: req.body.body, 
                                                            location: req.body.location });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: req.user_id }).exec();
    if (!user) return res.status(403).json({ message: "You must be signed in to add a post. You may sign up for an account, if you do not have one." });

    const files = req.files.post_photos;

    const urls = []

    if (Array.isArray(files)) {
        for (const file of files) {
            const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_post_images");
            if (!imageUpload) return res.status(400).json({ message: "Image upload failed" });
            
            urls.push(imageUpload.secure_url)
        }
    } else {
        const imageUpload = await cloudinaryImageUpload(files.tempFilePath, "frends_post_images");
        if (!imageUpload) return res.status(400).json({ message: "Image upload failed" });

        urls.push(imageUpload.secure_url)
    }
    
    const addPost = new Post({
        body: validatedData.body,
        picture_paths: urls,
        location: validatedData.location,
        reactions: {},
        created_by: req.user_id
    });

    addPost.save((error) => {
      if (error) {
        return res.status(400).json({ message: "An error occured", details: `${error}` });
      }
      res.status(201).json({ data: addPost, success: "Post added" });
    });
});

/**
 * @apiGroup Posts
 * @apiPermission auth
 * @api {patch} /api/v1/posts/:post 05. Update Post
 * @apiName UpdatePost
 * 
 * @apiParam {String} post Post's ID.
 * 
 * @apiDescription This updates an existing post.
 * 
 * @apiBody {String} [body]     Post content (body).
 * @apiBody {String} [location]       Location on the post.
 * @apiBody {Image} [post_photos]       Post images.
 * @apiExample {json} Request Body:
 *     {
 *       "body": "lorem ipsum ipsum ipsum ...",
 *       "location": "123 John Snow Street, New York",
 *       "post_photos": (image file), ...
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 UserUpdated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                  "location": "123 John Snow Street, New York",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *               },
 *       "success": "Post updated"
 *     }
 * 
 * @apiError PostUpdateErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed"
 *     }
 * 
 *     HTTP/1.1 400 ValidationError
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 *  
 *     HTTP/1.1 400 ImageUploadFailed
 *     {
 *       "message": "Image upload failed"
 *     }
 * 
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "message": "You do not have permission to update posts that do not belong to you"
 *     }
 * 
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "Post not found"
 *     }
 */
const updatePost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await updatePostSchema.validateAsync({ post: req.params.post, 
                                                            body: req.body.body, 
                                                            location: req.body.location });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: req.user_id }).exec();

    if (user._id != req.user_id) {
        res.status(403).json({ message: "You do not have permission to update posts that do not belong to you" })

    } else if (user._id == req.user_id) {
        const post = await Post.findOne({ _id: validatedData.post }).exec();
        if (!post) return res.status(404).json({ message: "Post not found" });

        const urls = []

        const files = req.files.post_photos;

        if (Array.isArray(files)) {
            for (const file of files) {
                const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_post_images");
                if (!imageUpload) return res.status(400).json({ message: "Image upload failed" });
                
                urls.push(imageUpload.secure_url)
            }
        } else {
            const imageUpload = await cloudinaryImageUpload(files.tempFilePath, "frends_post_images");
            if (!imageUpload) return res.status(400).json({ message: "Image upload failed" });

            urls.push(imageUpload.secure_url)
        }

        if (validatedData.body) post.body = validatedData.body;
        if (urls.length) {
            // for (const url of urls) {
            //     post.picture_paths.push(url);
            // }
            post.picture_paths = urls;
        }
        if (validatedData.location) post.location = validatedData.location;

        post.save((error) => {
            if (error) {
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({ success: "Post updated", data: post });
        });
    }
});

/**
 * @apiGroup Posts
 * @apiPermission auth, admin
 * @api {put} /api/v1/posts/:post 06. Update Post
 * @apiName UpdatePost
 * 
 * @apiParam {String} post Post's ID.
 * 
 * @apiDescription This updates an existing post.
 * 
 * @apiBody {String} [body]     Post content (body).
 * @apiBody {String} [location]       Location on the post.
 * @apiBody {Image} [post_photos]       Post images.
 * @apiExample {json} Request Body:
 *     {
 *       "body": "lorem ipsum ipsum ipsum ...",
 *       "location": "123 John Snow Street, New York",
 *       "post_photos": (image file), ...
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 UserUpdated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                  "location": "123 John Snow Street, New York",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *               },
 *       "success": "Post updated"
 *     }
 * 
 * @apiError PostUpdateErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed"
 *     }
 * 
 *     HTTP/1.1 400 ValidationError
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 *  
 *     HTTP/1.1 400 ImageUploadFailed
 *     {
 *       "message": "Image upload failed"
 *     }
 * 
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "message": "You do not have permission to update posts that do not belong to you"
 *     }
 * 
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "Post not found"
 *     }
 */
const updatePostAdminAccess = asyncHandler(async (req, res) => {

    let validatedData;
    try {
        validatedData = await updatePostSchema.validateAsync({ post: req.params.post, 
                                                            body: req.body.body, 
                                                            location: req.body.location });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ _id: validatedData.post }).exec();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const urls = []

    const files = req.files.post_photos;

    if (Array.isArray(files)) {
        for (const file of files) {
            const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_post_images");
            if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });
            
            urls.push(imageUpload.secure_url)
        }
    } else {
        const imageUpload = await cloudinaryImageUpload(files.tempFilePath, "frends_post_images");
        if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });

        urls.push(imageUpload.secure_url)
    }

    if (validatedData.body) post.body = validatedData.body;
    if (urls.length) {
        // for (const url of urls) {
        //     post.picture_paths.push(url);
        // }
        post.picture_paths = urls;
    }
    if (validatedData.location) post.location = validatedData.location;

    post.save((error) => {
        if (error) {
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(200).json({ success: "Post updated", data: post });
    });
});

/**
 * @apiGroup Posts
 * @apiPermission auth
 * @api {patch} /api/v1/posts/:post/reaction 07. React on Post
 * @apiName ReactOnPost
 * 
 * @apiParam {String} post Post's ID.
 * 
 * @apiDescription This adds/removes reaction from a post.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 PostReactedOn
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                  "location": "123 John Snow Street, New York",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Post reacted on"
 *     }
 * 
 * @apiError PostReactionErrors Possible error messages.
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
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "Post not found"
 *     }
 */
const reactOnPost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await postReactionSchema.validateAsync({ post: req.params.post });
    } catch (error) {
        return res.status(400).json({ message: "Parameter validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ _id: validatedData.post }).exec();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasReaction = post.reactions.get(req.user_id);

    if (!hasReaction) {
        post.reactions.set(req.user_id, true);
    } else {
        post.reactions.delete(req.user_id);
    };

    post.save((error) => {
        if (error) {
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(200).json({ success: "Post reacted on", data: post });
    });
});

// do not use this method for your frontend API endpoint consumption. Instead, use the update, where you populate the form fields with data from the "getPost" method above; and use this data to fill out the form (update the said post). I implemented this method just for fun. 
// @desc   Update image on post
// @route  PATCH /api/v1/posts/:post/images/:image
// @access Private
const updateImageOnPost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getPostSchema.validateAsync({ post: req.params.post, 
                                                            image: req.params.image });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ _id: validatedData.post }).exec();
    
    if (post.user != req.user_id) {
        res.status(403).json({ message: "You do not have permission to update images on posts that do not belong to you" });

    } else if (post.user == req.user_id) {
        if (post.picture_paths.includes(validatedData.image)) {
            post.picture_paths = post.picture_paths.filter((picture) => picture !== validatedData.image);

            if (req.files.post_photos) {
                const urls = []

                const files = req.files.post_photos;

                if (Array.isArray(files)) {
                    for (const file of files) {
                        const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_post_images");
                        if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });
                        
                        urls.push(imageUpload.secure_url)
                    }
                } else {
                    const imageUpload = await cloudinaryImageUpload(files.tempFilePath, "frends_post_images");
                    if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });

                    urls.push(imageUpload.secure_url)
                }

                if (urls.length) {
                    for (const url of urls) {
                        post.picture_paths.push(url);
                    }
                }

                post.save((error) => {
                    if (error) {
                        return res.status(400).json({ message: "An error occured", details: `${error}` });
                    }
                    res.status(200).json({ success: "Post image(s) updated", data: post });
                });
            }

        } else {
            res.status(404).json({ message: "The image you wish to replace, no longer exists in our records" })
        }

    } else if (post.user == req.user_id) {
        res.status(403).json({ message: "You do not have permission to update images on posts that do not belong to you" })
    }
});

/**
 * @apiGroup Posts
 * @apiPermission auth
 * @api {patch} /api/v1/posts/:post/delete 08. Soft-Delete Post
 * @apiName SoftDeletePost
 * 
 * @apiParam {String} post Post's ID.
 * 
 * @apiDescription This allows post to be soft-deleted.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 PostUpdated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                  "location": "123 John Snow Street, New York",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Post 641998f45d6408b13cb229b0 deleted"
 *     }
 * 
 * @apiError PostSoftDeleteErrors Possible error messages.
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
 *       "message": "You do not have permission to delete posts that do not belong to you"
 *     }
 * 
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "Post not found"
 *     }
 */
const softDeletePost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getPostSchema.validateAsync({ post: req.params.post });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const postFound = await Post.findOne({ _id: validatedData.post }).exec();
    if (!postFound) return res.status(404).json({ message: "Post not found" });

    if (postFound.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to delete posts that do not belong to you" })

    } else if (postFound.created_by == req.user_id) {

        if (postFound.deleted == false) {
            postFound.deleted = true;
            postFound.deleted_at = new Date().toISOString();
        }

        postFound.save((error) => {
            if (error) {
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({ success: `Post ${postFound._id} deleted` });
        });
    }
});

/**
 * @apiGroup Posts
 * @apiPermission auth, admin
 * @api {patch} /api/v1/posts/:post/undelete Re-activate 09. Soft-Deleted Post
 * @apiName ReactivateSoftDeletedPost
 * 
 * @apiParam {String} post Post's ID.
 * 
 * @apiDescription This allows soft-deleted post to be re-activated.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 PostReactivated
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                  "location": "123 John Snow Street, New York",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Post 641998f45d6408b13cb229b0 reactivated"
 *     }
 * 
 * @apiError PostSoftDeleteErrors Possible error messages.
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
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "Post not found"
 *     }
 */
const undeleteSoftDeletedPost = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getPostSchema.validateAsync({ post: req.params.post });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const postFound = await Post.findOne({ _id: validatedData.post }).exec();
    if (!postFound) return res.status(404).json({ message: "Post not found" });

    if (postFound.deleted == true) {
        postFound.deleted = false; 
        postFound.deleted_at = ''; 
    }

    postFound.save((error) => {
        if (error) {
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(200).json({ success: `Post ${postFound._id} reactivated` });
    });
});

/**
 * @apiGroup Posts
 * @apiPermission auth, admin
 * @api {delete} /api/v1/posts/:post 10. Delete Post (Permanently)
 * @apiName DeletePost
 * 
 * @apiParam {String} post Post's ID.
 * 
 * @apiDescription This allows for permanent deletion of post by admin.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 Deleted
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "body": "lorem ipsum ipsum ipsum",
 *                  "picture_paths": {"https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_post_images/qrcluilfzrfpzoofvyyc.jpg", ...},
 *                  "location": "123 John Snow Street, New York",
 *                  "reactions": {"641998f45d6408b13cb229b0", ...},
 *                  "created_by": "641998f45d6408b13cb229b0",
 *                  "deleted": false,
 *                  "created_at": "2023-07-01T10:59:17.117+00:00"
 *                  "updated_at": "2023-07-01T10:59:17.117+00:00"
 *                  "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *                },
 *       "success": "Post deleted"
 *     }
 * 
 * @apiError PostDeleteErrors Possible error messages.
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
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "No post matches the post 641998f45d6408b13cb229b0"
 *     }
 */
const deletePost = asyncHandler(async (req, res) => {
    if (!req?.params?.post) return res.status(400).json({ message: "Accurate post required" });

    let validatedData;
    try {
        validatedData = await getPostSchema.validateAsync({ post: req.params.post })
    } catch (error) {
        return res.status(400).json({ message: "Parameter validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ _id: validatedData.post }).exec();
    if (!post) {
        return res.status(404).json({ message: `No post matches the post ${validatedData.post}` });
    };

    const comment = await Comment.find({ on_post: post._id }).exec();
    if (!post && !comment) {
        return res.status(404).json({ message: `Neither comment nor post exist`})
    }

    if (comment) {
        // Delete all comments belonging to the deleted post if there are any.
        // await comment.deleteMany();
        await Comment.deleteMany({ on_post: post._id });
    }

    const deletedPost = await post.deleteOne();
    res.status(200).json({ data: deletedPost, success: "Post deleted" });
});


module.exports = {
    getAllPosts,
    getPost,
    getAuthUserPosts,
    getUserPosts,
    createPost,
    updatePost,
    updatePostAdminAccess, 
    reactOnPost, 
    updateImageOnPost, 
    softDeletePost,
    undeleteSoftDeletedPost,
    deletePost
};