const User = require('../models/User');
const cloudinaryImageUpload = require('../config/imageUpload/cloudinary');
const searchUsersSchema = require('../requestValidators/users/searchUsersValidator');
const getUserSchema = require('../requestValidators/users/getUserValidator');
const getUserFriendsSchema = require('../requestValidators/users/getUserFriendsValidator');
const createUserSchema = require('../requestValidators/users/createUserValidator');
const updateUserSchema = require('../requestValidators/users/updateUserValidator');
const addRemoveFriendSchema = require('../requestValidators/users/getUserFriendsValidator');
// const softDeletePostSchema = require('../requestValidators/users/sofDeleteUserValidator');
const deleteUserSchema = require('../requestValidators/users/deleteUserValidator')


const getAllUsers = async (req, res) => {
    const users = await User.find().sort('-created_at').lean();
    if (!users?.length) return res.status(404).json({ message: "No users found" });

    res.json(users);
};

const searchUsers = async (req, res) => {
    if (!req?.params?.searchKey) return res.status(400).json({ message: "Search key required" });

    let validatedData;
    try {
        validatedData = await searchUsersSchema.validateAsync({ searchKey: req.params.searchKey })
    } catch (error) {
        return res.status(400).json({ message: "Search key validation failed", details: `${error}` });
    }

    const users = await User.find({$or: [{username: validatedData.searchKey}, {first_name: validatedData.searchKey}, {other_names: validatedData.searchKey}, {last_name: validatedData.searchKey}, {occupation: validatedData.searchKey}, {location: validatedData.searchKey}]}).exec();
    if (!users?.length) return res.status(404).json({ message: "No user found" });

    res.status(200).json(users);
};

const getUser = async (req, res) => {
    if (!req?.params?.username) return res.status(400).json({ message: "Username required" });

    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ username: req.params.username })
    } catch (error) {
        return res.status(400).json({ message: "Search key validation failed", details: `${error}` });
    }
    
    const user = await User.findOne({ username: validatedData.username });
    if (!user) {
        return res.status(404).json({ message: `No user matches ${validatedData.username}` });
    }
    res.status(200).json(user.username, user.first_name, user.other_names, user.last_name, user.location, user.occupation, user.picture_path, user.friends, );
};

const getUserFriends = async (req, res) => {

    let validatedData;
    try {
        validatedData = await getUserFriendsSchema.validateAsync({ user: req.params.user })
    } catch (error) {
        return res.status(400).json({ message: "User search term validation failed", details: `${error}` });
    }

    const userFound = await User.findOne({ username: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    const friends = await Promise.all(
        userFound.friends.map((id) => User.find({ _id: id }))
    );

    if (!friends) return res.status(404).json({ message: "User has no friends" });

    const formattedFriends = friends.map(
        ({ first_name, last_name, occupation, location, picture_path}) => {
            return { first_name, last_name, occupation, location, picture_path };
        }
    );
    if (!formattedFriends?.length) return res.status(404).json({ message: "User has no friends" });

    res.status(200).json(formattedFriends);
};

const createUser = async (req, res) => {

    let validatedData;
    try {
        validatedData = await createUserSchema.validateAsync({ username: req.body.username, 
                                                            first_name: req.body.first_name,
                                                            other_names: req.body.other_names,
                                                            last_name: req.body.last_name,
                                                            email: req.body.email,
                                                            password: req.body.password,
                                                            type: req.body.type,
                                                            location: req.body.location, 
                                                            validUser: req.user._id });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const imageUpload = await cloudinaryImageUpload(image, "post_images");
    if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });

    let accountType;

    if (!validatedData.type) {
        accountType = ["level1"];
    } else if (validatedData.type && validatedData.type == "individual") {
        accountType = ["level1"];
    } else if (validatedData.type && validatedData.type == "business") {
        accountType = ["level2"];
    } else if (validatedData.type && validatedData.type == "individual", "business") {
        accountType = ["level1", "level2"];
    } else if (validatedData.type && validatedData.type == "individual", "business", "admin") {
        accountType = ["level1", "level2", "level3"];
    }

    const user = new User({
        username: validatedData.username,
        first_name: validatedData.first_name,
        other_names: validatedData.other_names,
        last_name: validatedData.last_name,
        email: validatedData.email,
        password: validatedData.password,
        picture_path: {
            public_id: imageUpload.public_id,
            url: imageUpload.secure_url
        },
        roles: accountType,
        location: validatedData.location,
        created_by: validatedData.validUser
    });

    user.save((error) => {
        if (error) {
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(201).json({ message: `User ${user.username} created` });
    });
};

const updateUser = async (req, res) => {

    let validatedData;
    try {
        validatedData = await updateUserSchema.validateAsync({ user: req.params.user, 
                                                            username: req.body.username, 
                                                            first_name: req.body.first_name,
                                                            other_names: req.body.other_names,
                                                            last_name: req.body.last_name,
                                                            email: req.body.email,
                                                            password: req.body.password,
                                                            type: req.body.type,
                                                            location: req.body.location });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const userFound = await User.findOne({ username: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    const imageUpload = await cloudinaryImageUpload(image, "post_images");
    if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });

    let accountType;

    if (!validatedData.type) {
        accountType = ["level1"];
    } else if (validatedData.type && validatedData.type == "individual") {
        accountType = ["level1"];
    } else if (validatedData.type && validatedData.type == "business") {
        accountType = ["level2"];
    } else if (validatedData.type && validatedData.type == "individual", "business") {
        accountType = ["level1", "level2"];
    }

    if (validatedData.username) userFound.validatedData.username = username;
    if (validatedData.first_name) userFound.first_name = validatedData.first_name;
    if (validatedData.other_names) userFound.other_names = validatedData.other_names;
    if (validatedData.last_name) userFound.last_name = validatedData.last_name;
    if (validatedData.email) userFound.email = validatedData.email;
    if (image) {
        userFound.picture_path.public_id = imageUpload.public_id;
        userFound.picture_path.url = imageUpload.secure_url;
    }
    if (validatedData.type) userFound.roles = accountType;
    if (validatedData.location) userFound.location = location;

    const updatedUser = await userFound.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({message: `User ${userFound.username} updated` });
    });
};

const addRemoveFriend = async (req, res) => {

    let validatedData;
    try {
        validatedData = await addRemoveFriendSchema.validateAsync({ id: req.params.id, 
                                                                    friendId: req.params.friendId })
    } catch (error) {
        return res.status(400).json({ message: "User search term validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: validatedData.id }).exec();
    const friend = await User.findOne({ _id: validatedData.friendId }).exec();

    if (user.friends.includes(validatedData.friendId)) {
        user.friends = user.friends.filter((id = validatedData.id) => id !== validatedData.friendId);
        friend.friends = friend.friends.filter((id = validatedData.id) => id !== id);
    } else {
        user.friends.push(validatedData.friendId);
        friend.friends.push(validatedData.id)
    }
    // await user.save((error) => {
    //   if (error) {
    //     return res.status(400).json(error);
    //   }
    //   res.status(201).json({ message: `User ${user} saved` });
    // });
    await user.save();
    await friend.save();

    const friends = await Promise.all(
        user.friends.map((id) => User.find({ _id: validatedData.id }))
    );

    const formattedFriends = friends.map(
        ({ first_name, last_name, occupation, location, picture_path }) => {
            return { first_name, last_name, occupation, location, picture_path };
        }
    );
    if (!formattedFriends) return res.status(404).json({ message: "There are no friends to display "});

    res.status(200).json(formattedFriends);
};

const softDeleteUser = async (req, res) => {
    // soft delete user (ie. do not remove user from database. but hide user from other users. also implement this on every search such that every user marked as deleted would not be displayed)
};

const deleteUser = async (req, res) => {

    let validatedData;
    try {
        validatedData = await deleteUserSchema.validateAsync({ username: req.params.username })
    } catch (error) {
        return res.status(400).json({ message: "User search term validation failed", details: `${error}` });
    }

    const user = await User.findOne({ username: validatedData.username }).exec();
    if (!user) {
        return res.status(404).json({ message: `No user matches the user ${validatedData.username}` });
    }

    const post = await Post.find({ user: user._id}).exec();
    if (!user && !post) {
        return res.status(404).json({ message: `No posts belong to the user`})
    }

    const deletedUser = await user.deleteOne();

    if (post) {
        // Delete all posts belonging to the deleted user if there is any.
        await post.deleteMany();
    }

    res.status(200).json(deletedUser);
};


module.exports = {
    getAllUsers,
    searchUsers,
    getUser,
    getUserFriends,
    createUser,
    updateUser,
    addRemoveFriend,
    softDeleteUser,
    deleteUser
}