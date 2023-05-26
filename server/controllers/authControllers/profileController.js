const asyncHandler = require('express-async-handler');
const cloudinaryImageUpload = require('../../config/imageUpload/cloudinary');
const User = require('../../models/User');
const updateUserSchema = require('../../requestValidators/users/updateUserValidator');


// @desc    Get user profile
// @route   GET /api/v1/auth/my-profile
// @access  Private
const getAuthUserProfile = asyncHandler(async (req, res) => {
    if (!req.user) {
        return res.status(404).json({ message: "User not found!" })

    } else if (req.user) {
        res.json({
            _id: req.user._id, 
            first_name: req.user.first_name, 
            last_name: req.user.last_name, 
            email: req.user.email,
        });
    }
});

// @desc    Get user profile
// @route   PUT /api/v1/auth/my-profile
// @access  Private
const updateAuthUserProfile = asyncHandler(async (req, res) => {

    let validatedData;
    try {
        validatedData = await updateUserSchema.validateAsync({ username: req.body.username, 
                                                            first_name: req.body.first_name,
                                                            other_names: req.body.other_names,
                                                            last_name: req.body.last_name,
                                                            email: req.body.email,
                                                            password: req.body.password,
                                                            account_type: req.body.account_type, 
                                                            location: req.body.location, 
                                                            show_online_status: req.body.show_online_status, 
                                                            show_friends: req.body.show_friends, 
                                                            occupation: req.body.occupation });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findById(req.user._id);

    if (user) {
        user.username = validatedData.username || user.username;
        user.first_name = validatedData.first_name || user.first_name;
        user.other_names = validatedData.other_names || user.other_names;
        user.last_name = validatedData.last_name || user.last_name;
        user.email = validatedData.email || user.email;
        user.password = validatedData.password || user.password;
        user.occupation = validatedData.occupation || user.occupation;
        user.location = validatedData.location || user.location;
        user.show_online_status = validatedData.show_online_status || user.show_online_status;
        user.show_friends = validatedData.show_friends || user.show_friends;

        // files and roles manipulations
        let profileImageUpload;
        let wallpaperImageUpload;

        if (req.files.profile_photo) {
            const profileImage = req.files.profile_photo

            profileImageUpload = await cloudinaryImageUpload(profileImage.tempFilePath, "frends_user_images");
            if (!profileImageUpload) return res.status(409).json({ message: "Image upload failed" });
        }

        if (req.files.wallpaper_photo) {
            const wallpaperImage = req.files.wallpaper_photo

            wallpaperImageUpload = await cloudinaryImageUpload(wallpaperImage.tempFilePath, "frends_user_images");
            if (!wallpaperImageUpload) return res.status(409).json({ message: "Image upload failed" });
        }


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
        // end of files and role manipulations

        if (profileImageUpload) {
            user.profile_image.public_id = profileImageUpload.public_id;
            user.profile_image.url = profileImageUpload.secure_url;
        }

        if (wallpaperImageUpload) {
            user.wallpaper_image.public_id = wallpaperImageUpload.public_id || user.wallpaper_image.public_id;
            user.wallpaper_image.url = wallpaperImageUpload.secure_url || user.wallpaper_image.url;
        }

        if (validatedData.account_type) user.roles = accountType;

        const updatedUser = await user.save();

        res.json({
            _id: updatedUser._id, 
            username: updatedUser.username, 
            first_name: updatedUser.first_name, 
            other_names: updatedUser.other_names, 
            last_name: updatedUser.last_name, 
            email: updatedUser.email, 
            occupation: updatedUser.occupation,
            location: updatedUser.location,
            show_online_status: updatedUser.show_online_status, 
            show_friends: updatedUser.show_friends, 
            account_type: updatedUser.roles, 
            profile_image: updatedUser.profile_image,
            wallpaper_image: updatedUser.wallpaper_image,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


module.exports = { 
    getAuthUserProfile, 
    updateAuthUserProfile
}