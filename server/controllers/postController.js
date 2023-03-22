const Post = require('../models/Post');
const User = require('../models/User');
const cloudinaryImageUpload = require('../config/imageUpload/cloudinary');
const getPostSchema = require('../requestValidators/posts/getPostValidator');
const getUserSchema = require('../requestValidators/users/getUserValidator');
const createPostSchema = require('../requestValidators/posts/createPostValidator');
const updatePostSchema = require('../requestValidators/posts/updatePostValidator');


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
            .select(['-password', '-email_verified', '-soft_deleted', '-active', '-created_by', '-created_at', '-updated_at'])
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

    for (const file of files) {
        const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_post_images");
        if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });
        
        urls.push(imageUpload.secure_url)
    }

    const addPost = new Post({
        body: validatedData.body,
        picture_paths: urls,
        location: validatedData.location,
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

        for (const file of files) {
            const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_post_images");
            if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });
            
            urls.push(imageUpload.secure_url)
        }

        if (validatedData.body) post.body = validatedData.body;
        if (urls.length) {
            for (const url of urls) {
                post.picture_paths.push(url);
            }
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

    for (const file of files) {
        const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_post_images");
        if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });
        
        urls.push(imageUpload.secure_url)
    }

    if (validatedData.body) post.body = validatedData.body;
    if (urls.length) {
        for (const url of urls) {
            post.picture_paths.push(url);
        }
    }
    if (validatedData.location) post.location = validatedData.location;

    post.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({ success: "Post updated", data: post });
    });
};

const likePost = async (req, res) => {

    let validatedData;
    try {
        validatedData = await getPostSchema.validateAsync({ post: req.params.post });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ _id: validatedData.post }).exec();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.get(req.user_id);

    if (!isLiked) {
        post.likes.set(req.user_id, true);
    } else {
        post.likes.delete(req.user_id);
    }

    // if (isLiked) {
    //     post.likes.delete(req.user_id);
    // } else {
    //     post.likes.set(req.user_id, true);
    // }

    post.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({ success: "Post liked", data: post });
    });
};

const commentOnPost = async (req, res) => {

}

const updateCommentOnPost = async (req, res) => {

}

const softDeletePost = async (req, res) => {
    
};

const undeleteSoftDeletedPost = async (req, res) => {

};

const deletePost = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ message: "Accurate post required" });

    let validatedData;
    try {
        validatedData = await deletePostSchema.validateAsync({ id: req.params.id })
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ _id: validatedData.id }).exec();
    if (!post) {
        return res.status(404).json({ message: `No post matches the post ${validatedData.id}` });
    };
    const deletedPost = await post.deleteOne();
    res.json(deletedPost);
};


module.exports = {
    getAllPosts,
    getPost,
    getAuthUserPosts,
    getUserPosts,
    createPost,
    updatePost,
    updatePostAdminAccess, 
    likePost,
    commentOnPost,
    updateCommentOnPost, 
    softDeletePost,
    undeleteSoftDeletedPost,
    deletePost
};