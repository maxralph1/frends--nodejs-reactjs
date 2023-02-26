const Post = require('../models/Post');
const User = require('../models/User');
const cloudinaryImageUpload = require('../config/imageUpload/cloudinary');
const createPostSchema = require('../requestValidators/posts/createPostValidator');
const updatePostSchema = require('../requestValidators/posts/updatePostValidator');


const getAllPosts = async (req, res) => {
    const posts = await Post.find();
    if (!posts) return res.status(404).json({ "message": "No posts found" });

    res.status(200).json(posts);
};

const getPost = async (req, res) => {
    if (!req?.params?.post) return res.status(400).json({ "message": "Post required" });
    const { post } = req.params;
    const postFound = await Post.findOne({ _id: post }).exec();
    if (!postFound) {
        return res.status(404).json({ "message": `No post matches ${req.params.post}` });
    }

    res.json(postFound);
};

const getUserPosts = async (req, res) => {
    const { username } = req.params;
    const user = await User.findOne({ username }).exec();
    if (!user) return res.status(404).json({ "message": "User does not exist. Perhaps, you should search by their names or other identification markers to see if you could find the user you are looking for." });

    const posts = await Post.find({ user: user._id });
    if (!posts) return res.status(404).json({ "message": "Found no posts belonging to user" });

    res.status(200).json(posts);
};

const createPost = async (req, res) => {
    try {
        const value = await createPostSchema.validateAsync({ body: req.body.body, 
                                                            image: req.body.image,
                                                            location: req.body.location });
    } catch (error) {
        return res.status(400).json({ "message": "Validation failed", "details": `${error}` });
    }

    const { body, image, location } = req.body;

    const user = await User.findOne({ _id: req.user._id }).exec();
    if (!user) return res.status(409).json({ "message": "You must be signed in to make a post. You may sign up for an account, if you do not have one." });

    const imageUpload = await cloudinaryImageUpload(image, "post_images");
    if (!imageUpload) return res.status(409).json({ "message": "Image upload failed" });

    const addPost = new Post({
        body,
        picture_path: {
            public_id: imageUpload.public_id,
            url: imageUpload.secure_url
        },
        location,
        user: req.user._id
    });

    const addedPost = await addPost.save((error) => {
      if (error) {
        return res.status(400).json(error);
      }
      res.status(201).json(addedPost);
    });
};

const updatePost = async (req, res) => {
    try {
        const value = await updatePostSchema.validateAsync({ body: req.body.body, 
                                                            image: req.body.image,
                                                            location: req.body.location });
    } catch (error) {
        return res.status(400).json({ "message": "Validation failed", "details": `${error}` });
    }

    const { id } = req.params;

    const { body, image, location } = req.body;

    const post = await Post.findOne({ _id: id }).exec();
    if (!post) return res.status(404).json({ "message": "Post not found" });

    const imageUpload = await cloudinaryImageUpload(image, "post_images");
    if (!imageUpload) return res.status(409).json({ "message": "Image upload failed" });

    if (body) post.body = body;
    if (image) {
        post.picture_path.public_id = imageUpload.public_id;
        post.picture_path.url = imageUpload.secure_url;
    }
    if (location) post.location = location;

    const updatedPost = await post.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(201).json(updatedPost);
    });
};

const likePost = async (req, res) => {
    const { id } = req.params;
    const { user } = red.body;
    const post = await Post.findOne({ _id: id }).exec();
    if (!post) return res.status(404).json({ "message": "Post not found" });

    const isLiked = post.likes.get(user);
    if (!isLiked) return res.status(404).json({ "message": "Post has neither been liked nor disliked by user" });

    if (isLiked) {
        post.likes.delete(user);
    } else {
        post.likes.set(user, true);
    }

    const updatedPost = await post.save();

    if (!updatedPost) return res.status(404).json({ "message": "Post not updated" });

    res.status(200).json(updatedPost);
};

const softDeletePost = async (req, res) => {
    
};

const deletePost = async (req, res) => {
    if (!req?.params?.id) return res.status(400).json({ "message": "Accurate post required" });

    const post = await Post.findOne({ _id: req.params.id }).exec();
    if (!post) {
        return res.status(404).json({ "message": `No post matches the post ${req.params.id}` });
    };
    const deletedPost = await post.deleteOne();
    res.json(deletedPost);
};


module.exports = {
    getAllPosts,
    getPost,
    getUserPosts,
    createPost,
    updatePost,
    likePost,
    softDeletePost,
    deletePost
};