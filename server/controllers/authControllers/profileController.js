const asyncHandler = require('express-async-handler');
const cloudinaryImageUpload = require('../../config/imageUpload/cloudinary');
const User = require('../../models/User');
const updateUserSchema = require('../../requestValidators/users/updateUserValidator');


/**
 * @apiGroup Auth
 * @apiPermission auth
 * @api {get} /api/v1/auth/my-profile Get Authenticated User Profile
 * @apiName GetUserProfile
 * 
 * @apiDescription This retrieves the authenticated user.
 *
 * @apiSuccess {String} username User username.
 * @apiSuccess {String} first_name User first name.
 * @apiSuccess {String} other_names User other name(s).
 * @apiSuccess {String} last_name User last name.
 * @apiSuccess {String} email User email.
 * @apiSuccess {Object} profile_image User profile image information.
 * @apiSuccess {String} profile_image.public_id User profile image (public id).
 * @apiSuccess {String} profile_image.url User profile image (url).
 * @apiSuccess {Object} wallpaper User wallpaper information.
 * @apiSuccess {String} wallpaper_image.public_id User wallpaper image (public id).
 * @apiSuccess {String} wallpaper_image.url User wallpaper image (url).
 * @apiSuccess {String} roles User roles.
 * @apiSuccess {Object} friends User friends.
 * @apiSuccess {String} location User location.
 * @apiSuccess {String} occupation User occupation.
 * @apiSuccess {Boolean} online User online status.
 * @apiSuccess {Boolean} show_online_status Show/Hide User online status.
 * @apiSuccess {String} last_time_active User last time online.
 * @apiSuccess {Boolean} show_friends Show/Hide User friends.
 * @apiSuccess {Object} followers User followers.
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "username": "testuser1",
 *       "first_name": "John",
 *       "other_names": "Dwight",
 *       "last_name": "Snow",
 *       "email": "johnsnow@email.com",
 *       "profile_image": {"public_id": "frends_user_images/qrcluilfzrfpzoofvyyc",
 *                         "url": "https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_user_images/qrcluilfzrfpzoofvyyc.jpg"},
 *       "wallpaper_image": {"public_id": "frends_user_images/qrcluilfzrfpzoofvyyc",
 *                           "url": "https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_user_images/qrcluilfzrfpzoofvyyc.jpg"},
 *       "roles": {"level4", ...},
 *       "friends": {"641998f45d6408b13cb229b0", ...},
 *       "location": "123 John Snow Street, New York",
 *       "occupation": "Software Engineer",
 *       "online": true,
 *       "show_online_status": true,
 *       "last_time_active": "2023-07-01T10:59:17.117+00:00",
 *       "show_friends": true,
 *       "followers": {"641998f45d6408b13cb229b0", ...},
 *     }
 * 
 * @apiError UserNotFound Possible profile error message if user is not the authenticated user.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 403 User Not Found
 *     {
 *       "message": "User not found"
 *     }
 */
const getAuthUserProfile = asyncHandler(async (req, res) => {
    if (!req.user_id) {
        return res.status(403).json({ message: "User not found" })

    } else if (req.user_id) {
        const user = await User.findOne({ _id: req.user_id })
            .select(['-password', '-email_verified', '-password_reset_token', '-email_verify_token', '-created_by', '-deleted_at', '-active', '-created_at', '-updated_at'])
            .lean();
        res.status(200).json({ data: user });
    }
});

/**
 * @apiGroup Auth
 * @apiPermission auth
 * @api {put} /api/v1/auth/my-profile Update Authenticated User Profile
 * @apiName UpdateUserProfile
 * 
 * @apiDescription This updates the authenticated user profile.
 * 
 * @apiBody {String} [username]     Username of the user.
 * @apiBody {String} [first_name]       First name of the user.
 * @apiBody {String} [other_names]       Other names of the user.
 * @apiBody {String} [email]       Email of the user.
 * @apiBody {String} [password]       Password of the user.
 * @apiBody {String} [account_type]       Account type of the user.
 * @apiBody {String} [location]       Location of the user.
 * @apiBody {String} [show_online_status]       Show online status of the user.
 * @apiBody {String} [show_friends]       Show friends of the user.
 * @apiBody {String} [occupation]       Occupation of the user.
 * @apiExample {json} Request Body:
 *     {
 *       "username": "testinguser1",
 *       "first_name": "John",
 *       "other_names": "Dwight",
 *       "last_name": "Snow",
 *       "email": "johnsnow@email.com",
 *       "occupation": "Software Engineer",
 *       "location": "123 John Snow Street, New York",
 *       "show_online_status": true,
 *       "show_friends": true,
 *       "account_type": "level4",
 *       "profile_image": "https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_user_images/qrcluilfzrfpzoofvyyc.jpg",
 *       "wallpaper_image": "https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_user_images/qrcluilfzrfpzoofvyyc.jpg",
 *     }
 *
 * @apiSuccess {String} username    User username.
 * @apiSuccess {String} first_name  User first name.
 * @apiSuccess {String} other_names     User other name(s).
 * @apiSuccess {String} last_name   User last name.
 * @apiSuccess {String} email   User email.
 * @apiSuccess {String} occupation  User occupation.
 * @apiSuccess {String} location    User location.
 * @apiSuccess {Boolean} show_online_status     Show/Hide User online status.
 * @apiSuccess {Boolean} show_friends   Show/Hide User friends.
 * @apiSuccess {String} profile_image   User profile image (url).
 * @apiSuccess {String} wallpaper_image     User wallpaper image (url).
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "data": {
 *                  "_id": "641998f45d6408b13cb229b0",
 *                  "username": "testuser1",
 *                  "first_name": "John",
 *                  "other_names": "Dwight",
 *                  "last_name": "Snow",
 *                  "email": "johnsnow@email.com",
 *                  "profile_image": {"public_id": "frends_user_images/qrcluilfzrfpzoofvyyc",
 *                                    "url": "https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_user_images/qrcluilfzrfpzoofvyyc.jpg"},
 *                  "wallpaper_image": {"public_id": "frends_user_images/qrcluilfzrfpzoofvyyc",
 *                                      "url": "https://res.cloudinary.com/dntmjpcmr/image/upload/v1684909658/frends_user_images/qrcluilfzrfpzoofvyyc.jpg"},
 *                  "roles": {"level4", ...},
 *                  "friends": {"641998f45d6408b13cb229b0", ...},
 *                  "location": "123 John Snow Street, New York",
 *                  "occupation": "Software Engineer",
 *                  "online": true,
 *                  "show_online_status": true,
 *                  "last_time_active": "2023-07-01T10:59:17.117+00:00",
 *                  "show_friends": true,
 *                  "followers": {"641998f45d6408b13cb229b0", ...}
 *              }
 *     }
 * 
 * @apiError UserNotFound Possible profile error message if user is not the authenticated user.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Validation Failed
 *     {
 *       "message": "Validation failed"
 *     }
 * 
 *     HTTP/1.1 404 User Not Found
 *     {
 *       "message": "User not found"
 *     }
 */
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

        res.status(200).json({
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
            profile_image: updatedUser.profile_image.url,
            wallpaper_image: updatedUser.wallpaper_image.url,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});


module.exports = { 
    getAuthUserProfile, 
    updateAuthUserProfile
};