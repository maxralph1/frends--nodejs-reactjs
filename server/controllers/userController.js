const User = require('../models/User');
const cloudinaryImageUpload = require('../config/imageUpload/cloudinary');


const getAllUsers = async (req, res) => {
    const users = await User.find().sort('-created_at');
    if (!users) return res.status(404).json({ "message": "No users found" });

    res.json(users);
};

const searchUsers = async (req, res) => {
    if (!req?.params?.searchKey) return res.status(400).json({ "message": "Search key required" });
    const { searchKey } = req.params;

    const users = await User.find({$or: [{username: searchKey}, {first_name: searchKey}, {other_names: searchKey}, {last_name: searchKey}, {occupation: searchKey}, {location: searchKey}]}).exec();
    if (!users) return res.status(404).json({ "message": "No user found" });

    res.status(200).json(users);
};

const getUser = async (req, res) => {
    if (!req?.params?.username) return res.status(400).json({ "message": "Username required" });
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
        return res.status(404).json({ "message": `No user matches ${username}` });
    }
    res.status(200).json(user);
};

const getUserFriends = async (req, res) => {
    const { user } = req.params;

    const userFound = await User.findOne({ username: user }).exec();
    if (!userFound) return res.status(404).json({ "message": "User not found" });

    const friends = await Promise.all(
        userFound.friends.map((id) => User.find({ _id: id }))
    );
    if (!friends) return res.status(404).json({ "message": "User has no friends" });

    const formattedFriends = friends.map(
        ({ first_name, last_name, occupation, location, picture_path}) => {
            return { first_name, last_name, occupation, location, picture_path };
        }
    );
    if (!formattedFriends) return res.status(404).json({ "message": "User has no friends" });

    res.status(200).json(formattedFriends);
};

const createUser = async (req, res) => {
    const { username, first_name, other_names, last_name, email, image, type, location } = req.body;

    const imageUpload = await cloudinaryImageUpload(image, "post_images");
    if (!imageUpload) return res.status(409).json({ "message": "Image upload failed" });

    let accountType;

    if (!type) {
        accountType = { "level1": 1000 };
    } else if (type && type == 'individual') {
        accountType = { "level1": 1000 };
    } else if (type && type == 'business') {
        accountType = { "level2": 2000 };
    } else if (type && type == 'individual', 'business') {
        accountType = { "level1": 1000, "level2": 2000 };
    }

    const user = new User({
        username,
        first_name,
        other_names,
        last_name,
        email,
        picture_path: {
            public_id: imageUpload.public_id,
            url: imageUpload.secure_url
        },
        roles: accountType,
        location,
        created_by: req.user._id
    });

    user.save((error) => {
        if (error) {
            return res.status(400).json({ "message": "An error occures", "details": `${error}` });
        }
        res.status(201).json({ "message": `User ${user.username} created` });
    });
};

const updateUser = async (req, res) => {
    const { user } = req.params;

    const { username, first_name, other_names, last_name, email, image, type, location } = req.body;

    const userFound = await User.findOne({ username }).exec();
    if (!userFound) return res.status(404).json({ "message": "user not found" });

    const imageUpload = await cloudinaryImageUpload(image, "post_images");
    if (!imageUpload) return res.status(409).json({ "message": "Image upload failed" });

    let accountType;

    if (!type) {
        accountType = { "level1": 1000 };
    } else if (type && type == 'individual') {
        accountType = { "level1": 1000 };
    } else if (type && type == 'business') {
        accountType = { "level2": 2000 };
    } else if (type && type == 'individual', 'business') {
        accountType = { "level1": 1000, "level2": 2000 };
    }

    if (username) user.username = username;
    if (first_name) user.first_name = first_name;
    if (other_names) user.other_names = other_names;
    if (last_name) user.last_name = last_name;
    if (email) user.email = email;
    if (image) {
        user.picture_path.public_id = imageUpload.public_id;
        user.picture_path.url = imageUpload.secure_url;
    }
    if (type) user.roles = accountType;
    if (location) user.location = location;

    const updatedUser = await user.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json(updatedUser);
    });
};

const addRemoveFriend = async (req, res) => {
    const { id, friendId } = req.params;
    const user = await User.findOne({ _id: id }).exec();
    const friend = await User.findOne({ _id: friendId }).exec();

    if (user.friends.includes(friendId)) {
        user.friends = user.friends.filter((id) => id !== friendId);
        friend.friends = friend.friends.filter((id) => id !== id);
    } else {
        user.friends.push(friendId);
        friend.friends.push(id)
    }
    // await user.save((error) => {
    //   if (error) {
    //     return res.status(400).json(error);
    //   }
    //   res.status(201).json({ "message": `User ${user} saved` });
    // });
    await user.save();
    await friend.save();

    const friends = await Promise.all(
        user.friends.map((id) => User.find({ _id: id }))
    );

    const formattedFriends = friends.map(
        ({ first_name, last_name, occupation, location, picture_path }) => {
            return { first_name, last_name, occupation, location, picture_path };
        }
    );
    if (!formattedFriends) return res.status(404).json({ "message": "There are no friends to display "});

    res.status(200).json(formattedFriends);
};

const softDeleteUser = async (req, res) => {
    // soft delete user (ie. do not remove user from database. but hide user from other users. also implement this on every search such that every user marked as deleted wouldf not be displayed)
};

const deleteUser = async (req, res) => {
    const { username } = req.params.username;

    if (!username) return res.status(400).json({ "message": "Accurate user required" });

    const user = await User.findOne({ username }).exec();
    if (!user) {
        return res.status(404).json({ "message": `No user matches the user ${username}` });
    }

    const post = await Post.find({ user: user._id}).exec();
    if (!user && !post) {
        return res.status(404).json({ "message": `No posts belong to the user`})
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