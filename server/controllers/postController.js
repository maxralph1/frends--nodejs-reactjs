const Post = require('../models/Post');
const User = require('../models/User');
const Comment = require('../models/Comment');
const cloudinaryImageUpload = require('../config/imageUpload/cloudinary');
const getPostSchema = require('../requestValidators/posts/getPostValidator');
const getUserSchema = require('../requestValidators/users/getUserValidator');
const createPostSchema = require('../requestValidators/posts/createPostValidator');
const updatePostSchema = require('../requestValidators/posts/updatePostValidator');
const postReactionSchema = require('../requestValidators/posts/postReactionValidator');


const getAllPosts = async (req, res) => {
    const posts = await Post.find().sort('-created_at').lean();
    if (!posts?.length) return res.status(404).json({ message: "No posts found" });

    res.status(200).json({ data: posts });
};

const getPost = async (req, res) => {
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

    res.json(postFound);
};

const getAuthUserPosts = async (req, res) => {
    if (!req.user_id) {
        return res.status(403).json({ message: "You are not logged in. You can only access logged in user's posts if you own those posts. Otherwise, you may wish to log in to view your posts or go to the post feeds for random posts" })

    } else if (req.user_id) {
        const posts = await Post.find({ created_by: req.user_id })
            .select(['-password', '-email_verified', '-deleted_at', '-active', '-created_by', '-created_at', '-updated_at'])
            .lean();

        if (!posts?.length) {
            return res.status(404).json({ message: "You have no posts yet" })
        }
        res.status(200).json({ data: posts });
    }
}

const getUserPosts = async (req, res) => {

    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user })
    } catch (error) {
        return res.status(400).json({ message: "Post key validation failed", details: `${error}` });
    }

    const user = await User.findOne({ username: validatedData.user }).exec();
    if (!user) return res.status(404).json({ message: "User does not exist. Perhaps, you should search by their names or other identification markers to see if you could find the user you are looking for." });

    const posts = await Post.find({ user: user._id });
    if (!posts?.length) return res.status(404).json({ message: "Found no posts belonging to user" });

    res.status(200).json(posts);
};

const createPost = async (req, res) => {

    let validatedData;
    try {
        validatedData = await createPostSchema.validateAsync({ body: req.body.body, 
                                                            location: req.body.location });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: req.user_id }).exec();
    if (!user) return res.status(409).json({ message: "You must be signed in to make a post. You may sign up for an account, if you do not have one." });

    const files = req.files.post_photos;

    const urls = []

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
};

const updatePost = async (req, res) => {

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
                return res.status(400).json(error);
            }
            res.status(200).json({ success: "Post updated", data: post });
        });
    }
};

const updatePostAdminAccess = async (req, res) => {

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
            return res.status(400).json(error);
        }
        res.status(200).json({ success: "Post updated", data: post });
    });
};

const reactOnPost = async (req, res) => {

    let validatedData;
    try {
        validatedData = await postReactionSchema.validateAsync({ post: req.params.post, 
                                                                reaction: req.body.reaction });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ _id: validatedData.post }).exec();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const hasReaction = post.reactions.get(req.user_id);

    if (!hasReaction) {
        post.reactions.set(req.user_id, validatedData.reaction);
    } else if (hasReaction == validatedData.reaction) {
        post.reactions.delete(req.user_id);
    } else if (hasReaction != validatedData.reaction) {
        post.reactions.set(req.user_id, validatedData.reaction);
    }

    post.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({ success: "Post reacted on", data: post });
    });
};

// do not use this method for your frontend API endpoint consumption. Instead, use the update, where you populate the form fields with data from the "getPost" method above; and use this data to fill out the form (update the said post). I implemented this method in for fun.
const updateImageOnPost = async (req, res) => {
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
                        return res.status(400).json(error);
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
    
};

const softDeletePost = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getPostSchema.validateAsync({ post: req.params.post });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const postFound = await Post.findOne({ _id: validatedData.post }).exec();
    if (!postFound) return res.status(404).json({ message: "Post not found" });

    if (postFound.created_by != req.user_id) {
        res.status(403).json({ message: "You do not have permission to delete comments that do not belong to you" })

    } else if (postFound.created_by == req.user_id) {

        if (postFound.deleted == false) {
            postFound.deleted = true;
            postFound.deleted_at = new Date().toISOString();
        }

        postFound.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({message: `Post deleted` });
        });
    }
};

const undeleteSoftDeletedPost = async (req, res) => {
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
            return res.status(400).json(error);
        }
        res.status(200).json({message: `Post ${postFound._id} reactivated` });
    });
};

const deletePost = async (req, res) => {
    if (!req?.params?.post) return res.status(400).json({ message: "Accurate post required" });

    let validatedData;
    try {
        validatedData = await getPostSchema.validateAsync({ post: req.params.post })
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
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
};


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