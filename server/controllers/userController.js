const bcrypt = require('bcrypt');
const User = require('../models/User');
const Post = require('../models/Post');
const cloudinaryImageUpload = require('../config/imageUpload/cloudinary');
const searchUsersSchema = require('../requestValidators/users/searchUsersValidator');
const getUserSchema = require('../requestValidators/users/getUserValidator');
const createUserSchema = require('../requestValidators/users/createUserValidator');
const updateUserSchema = require('../requestValidators/users/updateUserValidator');
const addRemoveFriendSchema = require('../requestValidators/users/addRemoveFriendValidator');


const getAllUsers = async (req, res) => {
    const users = await User.find().select(['-password', '-created_at', '-updated_at']).sort('-created_at').lean();
    if (!users?.length) return res.status(404).json({ message: "No users found" });

    res.status(200).json({ data: users });
};

const searchUsers = async (req, res) => {
    if (!req?.params?.searchKey) return res.status(400).json({ message: "Search key required" });

    let validatedData;
    try {
        validatedData = await searchUsersSchema.validateAsync({ searchKey: req.params.searchKey })
    } catch (error) {
        return res.status(400).json({ message: "Search key validation failed", details: `${error}` });
    }

    const users = await User
        .find({$or: [{username: new RegExp(validatedData.searchKey, 'i')}, {first_name: new RegExp(validatedData.searchKey, 'i')}, {other_names: new RegExp(validatedData.searchKey, 'i')}, {last_name: new RegExp(validatedData.searchKey, 'i')}, {occupation: new RegExp(validatedData.searchKey, 'i')}, {location: new RegExp(validatedData.searchKey, 'i')}]}).select(['-password', '-email_verified', '-active', '-created_by', '-created_at', '-updated_at'])
        .where({ active: true })
        .lean();
    
    if (!users?.length) return res.status(404).json({ message: "No user found" });

    res.status(200).json({ data: users });
};

const getUser = async (req, res) => {
    if (!req?.params?.user) return res.status(400).json({ message: "Username required" });

    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user })
    } catch (error) {
        return res.status(400).json({ message: "Search key validation failed", details: `${error}` });
    }
    
    const user = await User
        .findOne({$or: [{username: new RegExp(validatedData.user, 'i')}, {first_name: new RegExp(validatedData.user, 'i')}, {other_names: new RegExp(validatedData.user, 'i')}, {last_name: new RegExp(validatedData.user, 'i')}]})
        .where({ active: true })
        .lean();
    if (!user) {
        return res.status(404).json({ message: `No user matches ${validatedData.user}` });
    }
    res.status(200).json({ data: user });
};

const getUserFriends = async (req, res) => {

    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user })
    } catch (error) {
        return res.status(400).json({ message: "User search term validation failed", details: `${error}` });
    }

    const userFound = await User.findOne({ username: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    if (userFound.show_friends == false) {
        res.status(200).json({ message: "User has set their friends list to invisible" });

    } else if (userFound.show_friends == true) {

        const friends = await Promise.all(
            userFound.friends.map((id) => User.find({ _id: id }).select(['_id', 'username', 'first_name', 'last_name', 'occupation', 'location', 'picture_path']).lean())
        );

        if (!friends) return res.status(404).json({ message: "User has no friends" });

        const formattedFriends = friends.map(
            ( friend ) => {
                return { friend };
            }
        );

        if (!formattedFriends?.length) return res.status(404).json({ message: "User has no friends" });

        res.status(200).json({ data: formattedFriends });
    }
};

// @desc Create User
// @route POST /users
// @access Can only be accessed by admin
const createUser = async (req, res) => {

    let validatedData;
    try {
        validatedData = await createUserSchema.validateAsync({ username: req.body.username, 
                                                            first_name: req.body.first_name,
                                                            other_names: req.body.other_names,
                                                            last_name: req.body.last_name,
                                                            email: req.body.email,
                                                            password: req.body.password,
                                                            account_type: req.body.account_type, 
                                                            verified: req.body.verified, 
                                                            location: req.body.location, 
                                                            occupation: req.body.occupation, 
                                                            email_verified: req.body.email_verified, 
                                                            show_friends: req.body.show_friends,
                                                            active: req.body.active });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const duplicateUsername = await User.findOne({ username: validatedData.username }).lean();
    const duplicateEmail = await User.findOne({ email: validatedData.email }).lean();

    if (duplicateUsername) {
        return res.status(409).json({ message: `Username ${duplicateUsername.username} already exists` });
    } else if (duplicateEmail) {
        return res.status(409).json({ message: `User email ${duplicateEmail.email} already exists` });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const file = req.files.profile_photo

    const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_user_images");
    if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });

    let accountType;

    if (!validatedData.account_type) {
        accountType = ["level1"];
    } else if (validatedData.account_type && validatedData.account_type === "individual") {
        accountType = ["level1"];
    } else if (validatedData.account_type && validatedData.account_type === "enterprise") {
        accountType = ["level2"];
    } else if (validatedData.account_type && validatedData.account_type === "individual", "enterprise", "admin") {
        accountType = ["level1", "level2", "level3"];
    } else if (validatedData.account_type && validatedData.account_type === "enterprise", "admin") {
        accountType = ["level2", "level3"];
    } else if (validatedData.account_type && validatedData.account_type === "individual", "admin") {
        accountType = ["level1", "level3"];
    } else if (validatedData.account_type && validatedData.account_type === "individual", "enterprise") {
        accountType = ["level1", "level2"];
    }

    const user = new User({
        username: validatedData.username,
        first_name: validatedData.first_name,
        other_names: validatedData.other_names,
        last_name: validatedData.last_name,
        email: validatedData.email,
        password: hashedPassword,
        picture_path: {
            public_id: imageUpload.public_id,
            url: imageUpload.secure_url
        },
        roles: accountType,
        verified: validatedData.verified,
        location: validatedData.location,
        occupation: validatedData.occupation,
        email_verified: validatedData.email_verified, 
        show_friends: validatedData.show_friends, 
        followers: {},
        active: validatedData.active,
        created_by: req.user_id
    });

    user.save((error) => {
        if (error) {
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(201).json({ data: `${user.username}`, message: `User ${user.username} created` });
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
                                                            account_type: req.body.account_type, 
                                                            location: req.body.location, 
                                                            show_friends: req.body.show_friends, 
                                                            occupation: req.body.occupation });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const userFound = await User.findOne({ username: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    if (userFound._id != req.user_id) {
        res.status(403).json({ message: "You do not have permission to update user details" })

    } else if (userFound._id == req.user_id) {
        const file = req.files.profile_photo

        const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_user_images");
        if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });

        let accountType;

        if (!validatedData.account_type) {
            accountType = ["level1"];
        } else if (validatedData.account_type && validatedData.account_type === "individual") {
            accountType = ["level1"];
        } else if (validatedData.account_type && validatedData.account_type === "enterprise") {
            accountType = ["level2"];
        } else if (validatedData.account_type && validatedData.account_type === "individual", "enterprise") {
            accountType = ["level1", "level2"];
        }

        if (validatedData.username) userFound.username = validatedData.username;
        if (validatedData.first_name) userFound.first_name = validatedData.first_name;
        if (validatedData.other_names) userFound.other_names = validatedData.other_names;
        if (validatedData.last_name) userFound.last_name = validatedData.last_name;
        if (validatedData.email) userFound.email = validatedData.email;
        if (validatedData.password) userFound.password = hashedPassword;
        if (imageUpload) {
            userFound.picture_path.public_id = imageUpload.public_id;
            userFound.picture_path.url = imageUpload.secure_url;
        }
        if (validatedData.account_type) userFound.roles = accountType;
        if (validatedData.location) userFound.location = validatedData.location;
        if (validatedData.occupation) userFound.occupation = validatedData.occupation;
        if (validatedData.show_friends) userFound.show_friends = validatedData.show_friends;

        userFound.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({ success: `User ${userFound.username} updated` });
        });
    }
};

const updateUserAdminAccess = async (req, res) => {

    let validatedData;
    try {
        validatedData = await updateUserSchema.validateAsync({ user: req.params.user, 
                                                            username: req.body.username, 
                                                            first_name: req.body.first_name,
                                                            other_names: req.body.other_names,
                                                            last_name: req.body.last_name,
                                                            email: req.body.email,
                                                            password: req.body.password,
                                                            account_type: req.body.account_type, 
                                                            verified: req.body.verified, 
                                                            friends: req.body.friends, 
                                                            location: req.body.location, 
                                                            occupation: req.body.occupation, 
                                                            email_verified: req.body.email_verified, 
                                                            show_friends: req.body.show_friends,
                                                            active: req.body.active, 
                                                            deleted_at: req.body.deleted_at });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const userFound = await User.findOne({ username: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    const file = req.files.profile_photo

    const imageUpload = await cloudinaryImageUpload(file.tempFilePath, "frends_user_images");
    if (!imageUpload) return res.status(409).json({ message: "Image upload failed" });

    let accountType;

    if (!validatedData.account_type) {
        accountType = ["level1"];
    } else if (validatedData.account_type && validatedData.account_type === "individual") {
        accountType = ["level1"];
    } else if (validatedData.account_type && validatedData.account_type === "enterprise") {
        accountType = ["level2"];
    } else if (validatedData.account_type && validatedData.account_type === "individual", "enterprise", "admin") {
        accountType = ["level1", "level2", "level3"];
    } else if (validatedData.account_type && validatedData.account_type === "enterprise", "admin") {
        accountType = ["level2", "level3"];
    } else if (validatedData.account_type && validatedData.account_type === "individual", "admin") {
        accountType = ["level1", "level3"];
    } else if (validatedData.account_type && validatedData.account_type === "individual", "enterprise") {
        accountType = ["level1", "level2"];
    }

    if (validatedData.username) userFound.username = validatedData.username;
    if (validatedData.first_name) userFound.first_name = validatedData.first_name;
    if (validatedData.other_names) userFound.other_names = validatedData.other_names;
    if (validatedData.last_name) userFound.last_name = validatedData.last_name;
    if (validatedData.email) userFound.email = validatedData.email;
    if (validatedData.password) userFound.password = hashedPassword;
    if (imageUpload) {
        userFound.picture_path.public_id = imageUpload.public_id;
        userFound.picture_path.url = imageUpload.secure_url;
    }
    if (validatedData.account_type) userFound.roles = accountType;
    if (validatedData.verified) userFound.verified = validatedData.verified;
    if (validatedData.friends) userFound.friends = validatedData.friends;
    if (validatedData.location) userFound.location = validatedData.location;
    if (validatedData.occupation) userFound.occupation = validatedData.occupation;
    if (validatedData.email_verified) userFound.email_verified = validatedData.email_verified;
    if (validatedData.show_friends) userFound.show_friends = validatedData.show_friends;
    if (validatedData.active) userFound.active = validatedData.active;
    if (validatedData.deleted_at) userFound.deleted_at = validatedData.deleted_at;

    userFound.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({ data: userFound, success: `User ${userFound.username} updated` });
    });
};

const addRemoveFriend = async (req, res) => {

    let validatedData;
    try {
        validatedData = await addRemoveFriendSchema.validateAsync({ userId: req.params.userId, 
                                                                    friendId: req.params.friendId })
    } catch (error) {
        return res.status(400).json({ message: "User search term validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: validatedData.userId }).exec();
    const friend = await User.findOne({ _id: validatedData.friendId }).exec();

    if (user._id != req.user_id) {
        res.status(403).json({ message: "You do not have permission to add/remove friends that do not belong to you" })

    } else if (user._id == req.user_id) {
    
        if (user.friends.includes(validatedData.friendId)) {
            user.friends = user.friends.filter((userId = validatedData.userId) => userId !== validatedData.friendId);
            friend.friends = friend.friends.filter((userId = validatedData.userId) => userId !== userId);
        } else {
            user.friends.push(validatedData.friendId);
            friend.friends.push(validatedData.userId)
        }

        await user.save();
        await friend.save();

        const friends = await Promise.all(
            user.friends.map((id) => User.find({ _id: validatedData.userId }).select(['_id', 'first_name', 'last_name', 'occupation', 'location', 'picture_path']).lean())
        );

        const formattedFriends = friends.map(
            ( data ) => {
                return { data };
            }
        );
        if (!formattedFriends) return res.status(404).json({ message: "There are no friends to display "});

        res.status(200).json(formattedFriends);
    }
};

const followUnfollowUser = async (req, res) => {
    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: validatedData.user }).exec();
    if (!user) return res.status(404).json({ message: "User not found" });

    const isFollowing = user.followers.get(req.user_id);

    if (!isFollowing) {
        user.followers.set(req.user_id, true);
    } else {
        user.followers.delete(req.user_id);
    }

    user.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({ success: "Updated your user follow status", data: user });
    });
};

const softDeleteUser = async (req, res) => {
    // Consider using this method for your delete instead of the "deleteUser" method below

    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const userFound = await User.findOne({ username: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    if (userFound._id != req.user_id) {
        res.status(403).json({ message: "You do not have permission to update user details" })

    } else if (userFound._id == req.user_id) {

        if (userFound.active == true) {
            userFound.active = false;
            // userFound.deleted_at = Date();
            userFound.deleted_at = new Date().toISOString();
        }

        userFound.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
            res.status(200).json({message: `User ${userFound.username} inactivated / deleted` });
        });
    }
}

const reactivateSoftDeletedUser = async (req, res) => {

    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const userFound = await User.findOne({ username: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    if (userFound.active == false) {
        userFound.active = true; 
        userFound.deleted_at = ''; 
    }

    userFound.save((error) => {
        if (error) {
            return res.status(400).json(error);
        }
        res.status(200).json({message: `User ${userFound.username} reactivated` });
    });
}

const deleteUser = async (req, res) => {

    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user })
    } catch (error) {
        return res.status(400).json({ message: "User search term validation failed", details: `${error}` });
    }

    const user = await User.findOne({ username: validatedData.user }).exec();
    if (!user) {
        return res.status(404).json({ message: `No user matches the user ${validatedData.user}` });
    }

    const post = await Post.find({ user: user._id }).exec();
    if (!user && !post) {
        return res.status(404).json({ message: `Neither post nor user exist`})
    }

    if (post) {
        // Delete all posts belonging to the deleted user if there are any.
        // await post.deleteMany();
        await Post.deleteMany({ user: user._id });
    }

    const deletedUser = await user.deleteOne();

    res.status(200).json({ data: deletedUser, success: "User deleted" });
};


module.exports = {
    getAllUsers,
    searchUsers,
    getUser,
    getUserFriends,
    createUser,
    updateUser,
    updateUserAdminAccess,
    addRemoveFriend, 
    followUnfollowUser, 
    softDeleteUser,
    reactivateSoftDeletedUser,
    deleteUser
}