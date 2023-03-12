const Post = require('../models/Post');
const User = require('../models/User');
const cloudinaryImageUpload = require('../config/imageUpload/cloudinary');
const getPostSchema = require('../requestValidators/posts/getPostValidator');
const getUserPostsSchema = require('../requestValidators/posts/getUserPostsValidator')
const createPostSchema = require('../requestValidators/posts/createPostValidator');
const updatePostSchema = require('../requestValidators/posts/updatePostValidator');
const likePostSchema = require('../requestValidators/posts/likePostValidator');
// const softDeletePostSchema = require('../requestValidators/posts/softDeletePostValidator');
const deletePostSchema = require('../requestValidators/posts/deletePostValidator')


const getAllPosts = async (req, res) => {
    const posts = await Post.find().sort('-created_at').lean();
    if (!posts?.length) return res.status(404).json({ message: "No posts found" });

    res.status(200).json(posts);
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

const getUserPosts = async (req, res) => {

    let validatedData;
    try {
        validatedData = await getUserPostsSchema.validateAsync({ username: req.params.username })
    } catch (error) {
        return res.status(400).json({ message: "Post key validation failed", details: `${error}` });
    }

    const user = await User.findOne({ username: validatedData.username }).exec();
    if (!user) return res.status(404).json({ message: "User does not exist. Perhaps, you should search by their names or other identification markers to see if you could find the user you are looking for." });

    const posts = await Post.find({ user: user._id });
    if (!posts) return res.status(404).json({ message: "Found no posts belonging to user" });

    res.status(200).json(posts);
};

const createPost = async (req, res) => {

    let validatedData;
    try {
        validatedData = await createPostSchema.validateAsync({ body: req.body.body, 
                                                            // image: req.body.image,
                                                            location: req.body.location, 
                                                            validUser: req.user._id });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: validatedData.validUser }).exec();
    if (!user) return res.status(409).json({ message: "You must be signed in to make a post. You may sign up for an account, if you do not have one." });

    const imageUpload = await cloudinaryImageUpload(image, "post_images");
    if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });

    const addPost = new Post({
        body: validatedData.body,
        picture_path: {
            public_id: imageUpload.public_id,
            url: imageUpload.secure_url
        },
        location: validatedData.location,
        user: validatedData.validUser
    });

    addPost.save((error) => {
      if (error) {
        return res.status(400).json({ message: "An error occured", details: `${error}` });
      }
      res.status(201).json(addPost);
    });
};

const updatePost = async (req, res) => {

    let validatedData;
    try {
        validatedData = await updatePostSchema.validateAsync({ id: req.params.id, 
                                                            body: req.body.body, 
                                                            // image: req.body.image,
                                                            location: req.body.location });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ _id: validatedData.id }).exec();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const imageUpload = await cloudinaryImageUpload(image, "post_images");
    if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });

    if (validatedData.body) post.body = body;
    if (req.body.image) {
        post.picture_path.public_id = imageUpload.public_id;
        post.picture_path.url = imageUpload.secure_url;
    }
    if (validatedData.location) post.location = location;

    post.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json(post);
    });
};

const likePost = async (req, res) => {

    let validatedData;
    try {
        validatedData = await likePostSchema.validateAsync({ id: req.params.id, 
                                                            user: req.body.user });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const post = await Post.findOne({ _id: validatedData.id }).exec();
    if (!post) return res.status(404).json({ message: "Post not found" });

    const isLiked = post.likes.get(validatedData.user);

    if (!isLiked) return res.status(404).json({ message: "Post has neither been liked nor disliked by user" });

    if (isLiked) {
        post.likes.delete(user);
    } else {
        post.likes.set(user, true);
    }

    const updatedPost = await post.save();

    if (!updatedPost) return res.status(404).json({ message: "Post not updated" });

    res.status(200).json(updatedPost);
};

const softDeletePost = async (req, res) => {
    
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
    getUserPosts,
    createPost,
    updatePost,
    likePost,
    softDeletePost,
    deletePost
};