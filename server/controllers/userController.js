const asyncHandler = require('express-async-handler');
// const bcrypt = require('bcrypt');
const cloudinaryImageUpload = require('../config/imageUpload/cloudinary');
const User = require('../models/User');
const Post = require('../models/Post');
const searchUsersSchema = require('../requestValidators/users/searchUsersValidator');
const getUserSchema = require('../requestValidators/users/getUserValidator');
const createUserSchema = require('../requestValidators/users/createUserValidator');
const updateUserSchema = require('../requestValidators/users/updateUserValidator');
const addRemoveFriendSchema = require('../requestValidators/users/addRemoveFriendValidator');


/**
 * @apiGroup Users
 * @apiPermission auth, admin
 * @api {get} /api/v1/users 00. Get All Users
 * @apiName GetUsers
 * 
 * @apiDescription This retrieves all users.
 *
 * @apiSuccess {String} username User username.
 * @apiSuccess {String} first_name User first name.
 * @apiSuccess {String} other_names User other name(s).
 * @apiSuccess {String} last_name User last name.
 * @apiSuccess {String} email User email.
 * @apiSuccess {Object} profile_image User profile information.
 * @apiSuccess {String} profile_image.public_id User profile image (public id).
 * @apiSuccess {String} profile_image.url User profile image (url).
 * @apiSuccess {Object} wallpaper_image User wallpaper information.
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
 *       "data": {
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
 *                  "followers": {"641998f45d6408b13cb229b0", ...},
 *               }, ...
 *     }
 * 
 * @apiError NotFound Possible error message if no users found. Impossible as the authenticated user is already a user.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 NotFound
 *     {
 *       "message": "No Users found"
 *     }
 */
const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select(['-password', '-email_verified', '-password_reset_token', '-email_verify_token', '-created_by', '-deleted_at', '-active', '-created_at', '-updated_at']).sort('-created_at').lean();
    if (!users?.length) return res.status(404).json({ message: "No users found" });

    res.status(200).json({ data: users });
});

/**
 * @apiGroup Users
 * @apiPermission public
 * @api {get} /api/v1/users/search/:searchKey 01. Search (Find) Users
 * @apiName SearchUsers
 * 
 * @apiParam {String} searchKey User's search key (username, first_name, other_names, last_name, occupation or location).
 * 
 * @apiDescription This retrieves users based on the search key.
 *
 * @apiSuccess {String} username User username.
 * @apiSuccess {String} first_name User first name.
 * @apiSuccess {String} other_names User other name(s).
 * @apiSuccess {String} last_name User last name.
 * @apiSuccess {String} email User email.
 * @apiSuccess {Object} profile_image User profile information.
 * @apiSuccess {String} profile_image.public_id User profile image (public id).
 * @apiSuccess {String} profile_image.url User profile image (url).
 * @apiSuccess {Object} wallpaper_image User wallpaper information.
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
 *       "data": {
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
 *                  "followers": {"641998f45d6408b13cb229b0", ...},
 *               },
 *               {
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
 *                  "followers": {"641998f45d6408b13cb229b0", ...},
 *               }, ...
 *     }
 * 
 * @apiError NotFound Possible error message if no matching user(s) found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 NotFound
 *     {
 *       "message": "No User found"
 *     }
 */
const searchUsers = asyncHandler(async (req, res) => {
    if (!req?.params?.searchKey) return res.status(400).json({ message: "Search key required" });

    let validatedData;
    try {
        validatedData = await searchUsersSchema.validateAsync({ searchKey: req.params.searchKey })
    } catch (error) {
        return res.status(400).json({ message: "Search key validation failed", details: `${error}` });
    }

    const users = await User
        .find({$or: [{username: new RegExp(validatedData.searchKey, 'i')}, {first_name: new RegExp(validatedData.searchKey, 'i')}, {other_names: new RegExp(validatedData.searchKey, 'i')}, {last_name: new RegExp(validatedData.searchKey, 'i')}, {occupation: new RegExp(validatedData.searchKey, 'i')}, {location: new RegExp(validatedData.searchKey, 'i')}]}).select(['-password', '-email_verified', '-password_reset_token', '-email_verify_token', '-created_by', '-deleted_at', '-active', '-created_at', '-updated_at'])
        .where({ active: true })
        .lean();
    
    if (!users?.length) return res.status(404).json({ message: "No user found" });

    res.status(200).json({ data: users });
});

/**
 * @apiGroup Users
 * @apiPermission public
 * @api {get} /api/v1/users/:user 02. Get User
 * @apiName GetUser
 * 
 * @apiParam {String} user User's ID.
 * 
 * @apiDescription This retrieves user based on the :user parameter.
 *
 * @apiSuccess {String} username User username.
 * @apiSuccess {String} first_name User first name.
 * @apiSuccess {String} other_names User other name(s).
 * @apiSuccess {String} last_name User last name.
 * @apiSuccess {String} email User email.
 * @apiSuccess {Object} profile_image User profile information.
 * @apiSuccess {String} profile_image.public_id User profile image (public id).
 * @apiSuccess {String} profile_image.url User profile image (url).
 * @apiSuccess {Object} wallpaper_image User wallpaper information.
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
 *       "data": {
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
 *                  "followers": {"641998f45d6408b13cb229b0", ...},
 *               }
 *     }
 * 
 * @apiError NotFound Possible error message if no matching user found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 404 NotFound
 *     {
 *       "message": "No User matches user 641998f45d6408b13cb229b0"
 *     }
 */
const getUser = asyncHandler(async (req, res) => {
    if (!req?.params?.user) return res.status(400).json({ message: "User required" });

    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user })
    } catch (error) {
        return res.status(400).json({ message: "Search key validation failed", details: `${error}` });
    }
    
    const user = await User
        .findOne({_id: validatedData.user})
        .where({ active: true })
        .lean();
    if (!user) {
        return res.status(404).json({ message: `No user matches user ${validatedData.user}` });
    }
    res.status(200).json({ data: user });
});

/**
 * @apiGroup Users
 * @apiPermission public
 * @api {get} /api/v1/users/:user/friends 03. Get User Friends
 * @apiName GetUserFriends
 * 
 * @apiParam {String} user User's ID.
 * 
 * @apiDescription This retrieves user based on the :user parameter.
 *
 * @apiSuccess {String} username User username.
 * @apiSuccess {String} first_name User first name.
 * @apiSuccess {String} other_names User other name(s).
 * @apiSuccess {String} last_name User last name.
 * @apiSuccess {String} email User email.
 * @apiSuccess {Object} profile_image User profile information.
 * @apiSuccess {String} profile_image.public_id User profile image (public id).
 * @apiSuccess {String} profile_image.url User profile image (url).
 * @apiSuccess {Object} wallpaper_image User wallpaper information.
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
 *       "data": {
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
 *                  "followers": {"641998f45d6408b13cb229b0", ...},
 *               },
 *               {
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
 *                  "followers": {"641998f45d6408b13cb229b0", ...},
 *               }, ...
 *     }
 * 
 * @apiError NotFound Possible error messages if no matching user found.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Parameter Validation failed"
 *     }
 * 
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed"
 *     }
 * 
 *     HTTP/1.1 404 NotFound
 *     {
 *       "message": "User has no friends"
 *     }
 */
const getUserFriends = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user })
    } catch (error) {
        return res.status(400).json({ message: "Parameter validation failed", details: `${error}` });
    }

    const userFound = await User.findOne({ _id: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    if (userFound.show_friends == false) {
        return res.status(200).json({ message: "User has set their friends list to invisible" });

    } else if (userFound.show_friends == true) {

        const friends = await Promise.all(
            userFound.friends.map((id) => User.find({ _id: id }).select(['-password', '-email_verified', '-password_reset_token', '-email_verify_token', '-created_by', '-deleted_at', '-active', '-created_at', '-updated_at']).lean())
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
});

/**
 * @apiGroup Users
 * @apiPermission auth, admin
 * @api {post} /api/v1/users 04. Create New User
 * @apiName CreateNewUser
 * 
 * @apiDescription This creates a new user.
 * 
 * @apiBody {String} username     Username of the user.
 * @apiBody {String} first_name       First name of the user.
 * @apiBody {String} other_names       Other names of the user.
 * @apiBody {String} last_name       Last name of the user.
 * @apiBody {String} email       Email of the user.
 * @apiBody {String} password       Password of the user.
 * @apiBody {String} account_type       Account type of the user.
 * @apiBody {Boolean} verified       Location of the user.
 * @apiBody {String} location       Location of the user.
 * @apiBody {String} occupation       Occupation of the user.
 * @apiBody {Boolean} email_verified       Email verification styatus of the user.
 * @apiBody {Boolean} show_friends       Show friends of the user.
 * @apiBody {Boolean} active       User status (active/inactive).
 * @apiBody {Image} [profile_image]       User profile image.
 * @apiBody {Image} [wallpaper_image]       User wallpaper image.
 * @apiExample {json} Request Body:
 *     {
 *       "username": "testinguser1",
 *       "first_name": "John",
 *       "other_names": "Dwight",
 *       "last_name": "Snow",
 *       "email": "johnsnow@email.com",
 *       "password": "testingpassword1",
 *       "account_type": "level4",
 *       "verified": true,
 *       "location": "123 John Snow Street, New York",
 *       "occupation": "Software Engineer",
 *       "email_verified": true,
 *       "show_friends": true,
 *       "active": true,
 *       "profile_image": (image file),
 *       "wallpaper_image": (image file),
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 UserCreated
 *     {
 *       "data": {
 *                  "user_id": "641998f45d6408b13cb229b0"
 *                },
 *       "success": "User testusername1 created"
 *     }
 * 
 * @apiError CreateUserErrors Possible error messages.
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
 *     HTTP/1.1 409 Conflict
 *     {
 *       "message": "Username testusername1 already exists"
 *     }
 * 
 *     HTTP/1.1 400 ImageUploadFailed
 *     {
 *       "message": "Image upload failed"
 *     }
 */
const createUser = asyncHandler(async (req, res) => {
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

    let profileImageUpload;
    let wallpaperImageUpload;

    if (req.files.profile_photo) {
        const profileImage = req.files.profile_photo

        profileImageUpload = await cloudinaryImageUpload(profileImage.tempFilePath, "frends_user_images");
        if (!profileImageUpload) return res.status(400).json({ message: "Image upload failed" });
    }

    if (req.files.wallpaper_photo) {
        const wallpaperImage = req.files.wallpaper_photo

        wallpaperImageUpload = await cloudinaryImageUpload(wallpaperImage.tempFilePath, "frends_user_images");
        if (!wallpaperImageUpload) return res.status(400).json({ message: "Image upload failed" });
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

    const user = new User({
        username: validatedData.username,
        first_name: validatedData.first_name,
        other_names: validatedData.other_names,
        last_name: validatedData.last_name,
        email: validatedData.email,
        password: hashedPassword,
        profile_image: {
            public_id: profileImageUpload.public_id,
            url: profileImageUpload.secure_url
        },
        wallpaper_image: {
            public_id: wallpaperImageUpload.public_id,
            url: wallpaperImageUpload.secure_url
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
        res.status(201).json({ 
                                data: {
                                        "user_id": `${user._id}` 
                                    }, 
                                success: `User ${user.username} created` 
                            });
    });
});

/**
 * @apiGroup Users
 * @apiPermission auth
 * @api {patch} /api/v1/users/:user 05. Update User
 * @apiName UpdateUser
 * 
 * @apiParam {String} user User's ID.
 * 
 * @apiDescription This updates an existing user.
 * 
 * @apiBody {String} [username]     Username of the user.
 * @apiBody {String} [first_name]       First name of the user.
 * @apiBody {String} [other_names]       Other names of the user.
 * @apiBody {String} [last_name]       Last name of the user.
 * @apiBody {String} [email]       Email of the user.
 * @apiBody {String} [password]       Password of the user.
 * @apiBody {String} [account_type]       Account type of the user.
 * @apiBody {String} [location]       Location of the user.
 * @apiBody {String} [occupation]       Occupation of the user.
 * @apiBody {Boolean} [show_friends]       Show friends of the user.
 * @apiBody {Image} [profile_image]       User profile image.
 * @apiBody {Image} [wallpaper_image]       User wallpaper image.
 * @apiExample {json} [Request Body:
 *     {
 *       "username": "testinguser1",
 *       "first_name": "John",
 *       "other_names": "Dwight",
 *       "last_name": "Snow",
 *       "email": "johnsnow@email.com",
 *       "password": "testingpassword1",
 *       "account_type": "level4",
 *       "location": "123 John Snow Street, New York",
 *       "occupation": "Software Engineer",
 *       "show_friends": true,
 *       "profile_image": (image file),
 *       "wallpaper_image": (image file),
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 UserUpdated
 *     {
 *       "data": {
 *                  "user_id": "641998f45d6408b13cb229b0"
 *                },
 *       "success": "User testusername1 updated"
 *     }
 * 
 * @apiError UserUpdateErrors Possible error messages.
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
 *       "message": "You do not have permission to update user details"
 *     }
 * 
 *     HTTP/1.1 404 UserNotFound
 *     {
 *       "message": "User not found"
 *     }
 * 
 *     HTTP/1.1 409 Conflict
 *     {
 *       "message": "Username testusername1 already exists"
 *     }
 */
const updateUser = asyncHandler(async (req, res) => {
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
                                                            occupation: req.body.occupation, 
                                                            show_friends: req.body.show_friends });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    // const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const userFound = await User.findOne({ _id: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    if (userFound._id != req.user_id) {
        res.status(403).json({ message: "You do not have permission to update user details" })

    } else if (userFound._id == req.user_id) {
        let profileImageUpload;
        let wallpaperImageUpload;

        if (req.files.profile_photo) {
            const profileImage = req.files.profile_photo

            profileImageUpload = await cloudinaryImageUpload(profileImage.tempFilePath, "frends_user_images");
            if (!profileImageUpload) return res.status(409).json({ message: "Image upload failed" });
        };

        if (req.files.wallpaper_photo) {
            const wallpaperImage = req.files.wallpaper_photo

            wallpaperImageUpload = await cloudinaryImageUpload(wallpaperImage.tempFilePath, "frends_user_images");
            if (!wallpaperImageUpload) return res.status(409).json({ message: "Image upload failed" });
        };

        let accountType;

        if (!validatedData.account_type) {
            accountType = ["level1"];
        } else if (validatedData.account_type && validatedData.account_type === "individual") {
            accountType = ["level1"];
        } else if (validatedData.account_type && validatedData.account_type === "enterprise") {
            accountType = ["level2"];
        } else if (validatedData.account_type && validatedData.account_type === "individual", "enterprise") {
            accountType = ["level1", "level2"];
        };

        if (validatedData.username) userFound.username = validatedData.username;
        if (validatedData.first_name) userFound.first_name = validatedData.first_name;
        if (validatedData.other_names) userFound.other_names = validatedData.other_names;
        if (validatedData.last_name) userFound.last_name = validatedData.last_name;
        if (validatedData.email) userFound.email = validatedData.email;
        if (validatedData.password) userFound.password = validatedData.password;
        if (profileImageUpload) {
            userFound.profile_image.public_id = profileImageUpload.public_id;
            userFound.profile_image.url = profileImageUpload.secure_url;
        };
        if (wallpaperImageUpload) {
            userFound.wallpaper_image.public_id = wallpaperImageUpload.public_id;
            userFound.wallpaper_image.url = wallpaperImageUpload.secure_url;
        };
        if (validatedData.account_type) userFound.roles = accountType;
        if (validatedData.location) userFound.location = validatedData.location;
        if (validatedData.occupation) userFound.occupation = validatedData.occupation;
        if (validatedData.show_friends) userFound.show_friends = validatedData.show_friends;

        userFound.save((error) => {
            if (error) {
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({ 
                                    data: {
                                            "user_id": `${userFound._id}` 
                                        }, 
                                    success: `User ${userFound.username} updated` 
                                });
        });
    }
});

/**
 * @apiGroup Users
 * @apiPermission auth, admin
 * @api {put} /api/v1/users/:user 06. Update User (Admin Access)
 * @apiName UpdateUserAdminAccess
 * 
 * @apiParam {String} user User's ID.
 * 
 * @apiDescription This updates an existing user.
 * 
 * @apiBody {String} [username]     Username of the user.
 * @apiBody {String} [first_name]       First name of the user.
 * @apiBody {String} [other_names]       Other names of the user.
 * @apiBody {String} [last_name]       Last name of the user.
 * @apiBody {String} [email]       Email of the user.
 * @apiBody {String} [password]       Password of the user.
 * @apiBody {String} [account_type]       Account type of the user.
 * @apiBody {Boolean} [verified]       User verification status by Frends admin.
 * @apiBody {Object} [friends]       User list of friends.
 * @apiBody {String} [location]       Location of the user.
 * @apiBody {String} [occupation]       Occupation of the user.
 * @apiBody {Boolean} [email_verified]       User registration (email) verification status.
 * @apiBody {Boolean} [show_friends]       Show friends of the user.
 * @apiBody {Boolean} [active]       User active/deleted.
 * @apiBody {String} [deleted_at]       Deletion date and time of user.
 * @apiBody {Image} [profile_image]       User profile image.
 * @apiBody {Image} [wallpaper_image]       User wallpaper image.
 * @apiExample {json} Request Body:
 *     {
 *       "username": "testinguser1",
 *       "first_name": "John",
 *       "other_names": "Dwight",
 *       "last_name": "Snow",
 *       "email": "johnsnow@email.com",
 *       "password": "testingpassword1",
 *       "account_type": "level4",
 *       "verified": true,
 *       "friends": {
 *                      "641998f45d6408b13cb229b0", ...
 *                  },
 *       "location": "123 John Snow Street, New York",
 *       "occupation": "Software Engineer",
 *       "email_verified": "true",
 *       "show_friends": "true",
 *       "active": "true",
 *       "deleted_at": "2023-07-01T10:59:17.117+00:00"
 *       "profile_image": (image file),
 *       "wallpaper_image": (image file),
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 UserUpdated
 *     {
 *       "data": {
 *                  "user_id": "641998f45d6408b13cb229b0"
 *                },
 *       "success": "User testusername1 updated"
 *     }
 * 
 * @apiError UserUpdateErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed"
 *     }
 * 
 *     HTTP/1.1 400 Error
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
 *       "message": "You do not have permission to update user details"
 *     }
 * 
 *     HTTP/1.1 404 UserNotFound
 *     {
 *       "message": "User not found"
 *     }
 * 
 *     HTTP/1.1 409 Conflict
 *     {
 *       "message": "Username testusername1 already exists"
 *     }
 */
const updateUserAdminAccess = asyncHandler(async (req, res) => {
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
    };

    // const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const userFound = await User.findOne({ _id: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

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
    };

    if (validatedData.username) userFound.username = validatedData.username;
    if (validatedData.first_name) userFound.first_name = validatedData.first_name;
    if (validatedData.other_names) userFound.other_names = validatedData.other_names;
    if (validatedData.last_name) userFound.last_name = validatedData.last_name;
    if (validatedData.email) userFound.email = validatedData.email;
    if (validatedData.password) userFound.password = validatedData.password;
    if (profileImageUpload) {
        userFound.profile_image.public_id = profileImageUpload.public_id;
        userFound.profile_image.url = profileImageUpload.secure_url;
    };
    if (wallpaperImageUpload) {
        userFound.wallpaper_image.public_id = wallpaperImageUpload.public_id;
        userFound.wallpaper_image.url = wallpaperImageUpload.secure_url;
    };
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
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({ 
                                data: {
                                        "user_id": `${userFound._id}` 
                                    }, 
                                success: `User ${userFound.username} updated` 
                            });
    });
});

/**
 * @apiGroup Users
 * @apiPermission auth
 * @api {patch} /api/v1/users/:userId/friend/:friendId 07. Add/Remove Friend
 * @apiName AddRemoveFriend
 * 
 * @apiParam {String} userId User's ID.
 * @apiParam {String} friendId Friend's IDs.
 * 
 * @apiDescription This adds/removes friend from user's friends' list.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 UserUpdated
 *     {
 *       "data": {
 *                  "friends": {"641998f45d6408b13cb229b0", ...}
 *                },
 *       "success": "Friend status updated"
 *     }
 * 
 * @apiError FriendsUpdateErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Parameter(s) Validation failed"
 *     }
 * 
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "message": "You do not have permission to add/remove friends that do not belong to you"
 *     }
 * 
 *     HTTP/1.1 404 FriendsNotFound
 *     {
 *       "message": "There are no friends to display"
 *     }
 */
const addRemoveFriend = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await addRemoveFriendSchema.validateAsync({ userId: req.params.userId, 
                                                                    friendId: req.params.friendId })
    } catch (error) {
        return res.status(400).json({ message: "Parameter(s) validation failed", details: `${error}` });
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
        if (!formattedFriends) return res.status(404).json({ message: "There are no friends to display"});

        res.status(200).json({ 
                            data: {"friends": `${formattedFriends}`}, 
                            success: `Friend status updated` 
                        });
    }
});

/**
 * @apiGroup Users
 * @apiPermission auth
 * @api {patch} /api/v1/users/:user/follows 08. Follow/Unfollow User
 * @apiName FollowUnfollowUser
 * 
 * @apiParam {String} user User's ID.
 * 
 * @apiDescription This adds/removes user from another user's followers' list.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 UserFollowUpdated
 *     {
 *       "data": {
 *                  "user_id": "641998f45d6408b13cb229b0"
 *                },
 *       "success": "Updated your user testusername1 follow status"
 *     }
 * 
 * @apiError UserFollowUpdateErrors Possible error messages.
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
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "message": "You do not have permission to add/remove friends that do not belong to you"
 *     }
 * 
 *     HTTP/1.1 404 FriendsNotFound
 *     {
 *       "message": "User not found"
 *     }
 */
const followUnfollowUser = asyncHandler(async (req, res) => {
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
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(200).json({ 
                            data: {"user_id": `${user._id}`}, 
                            success: `Updated your user ${user.username} follow status` 
                        });
    });
});

/**
 * @apiGroup Users
 * @apiPermission auth
 * @api {patch} /api/v1/users/:user/delete 09. Soft-Delete User (User Deactivates Self-Account)
 * @apiName SoftDeleteUser
 * 
 * @apiParam {String} user User's ID.
 * 
 * @apiDescription This allows user to de-activate account (delete self).
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 UserUpdated
 *     {
 *       "data": {
 *                  "user_id": "641998f45d6408b13cb229b0"
 *                },
 *       "success": "User testusername1 inactivated / deleted"
 *     }
 * 
 * @apiError UserSoftDeleteErrors Possible error messages.
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
 *     HTTP/1.1 403 Unauthorized
 *     {
 *       "message": "You do not have the required permission to execute this action"
 *     }
 * 
 *     HTTP/1.1 404 UserNotFound
 *     {
 *       "message": "User not found"
 *     }
 */
const softDeleteUser = asyncHandler(async (req, res) => {
    // Consider using this method for your delete instead of the "deleteUser" method below

    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const userFound = await User.findOne({ _id: validatedData.user }).exec();
    if (!userFound) return res.status(404).json({ message: "User not found" });

    if (userFound._id != req.user_id) {
        res.status(403).json({ message: "You do not have the required permission to execute this action" })

    } else if (userFound._id == req.user_id) {

        if (userFound.active == true) {
            userFound.active = false;
            // userFound.deleted_at = Date();
            userFound.deleted_at = new Date().toISOString();
        }

        userFound.save((error) => {
            if (error) {
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({ 
                                    data: {"user_id": `${userFound._id}`}, 
                                    success: `User ${userFound.username} inactivated / deleted` 
                                });
        });
    }
});

/**
 * @apiGroup Users
 * @apiPermission auth, admin
 * @api {patch} /api/v1/users/:user/re-activate 10. Re-activate Soft-Deleted User
 * @apiName ReactivateSoftDeletedUser
 * 
 * @apiParam {String} user User's ID.
 * 
 * @apiDescription This allows sof-deleted user account to be re-activated.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 UserReactivated
 *     {
 *       "data": {
 *                  "user_id": "641998f45d6408b13cb229b0"
 *                },
 *       "success": "User testusername1 inactivated / deleted"
 *     }
 * 
 * @apiError UserSoftDeleteErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Validation failed"
 *     }
 * 
 *     HTTP/1.1 400 Error
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 404 UserNotFound
 *     {
 *       "message": "User not found"
 *     }
 */
const reactivateSoftDeletedUser = asyncHandler(async (req, res) => {

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
                return res.status(400).json({ message: "An error occured", details: `${error}` });
            }
            res.status(200).json({ 
                                    data: {"user_id": `${userFound._id}`}, 
                                    success: `User ${userFound.username} reactivated` 
                                });
    });
});

/**
 * @apiGroup Users
 * @apiPermission auth, admin
 * @api {delete} /api/v1/users/:user 11. Delete User (Permanently)
 * @apiName DeleteUser
 * 
 * @apiParam {String} user User's ID.
 * 
 * @apiDescription This allows for permanent deletion of user account and their posts by admin.
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 Deleted
 *     {
 *       "data": {
 *                  "user_id": "641998f45d6408b13cb229b0"
 *                },
 *       "success": "User testusername1 inactivated / deleted"
 *     }
 * 
 * @apiError UserDeleteErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 ValidationFailed
 *     {
 *       "message": "Parameter validation failed"
 *     }
 * 
 *     HTTP/1.1 400 Error
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 404 UserNotFound
 *     {
 *       "message": "No user matches the user 641998f45d6408b13cb229b0"
 *     }
 * 
 *     HTTP/1.1 404 PostNotFound
 *     {
 *       "message": "Neither post nor user exist"
 *     }
 */
const deleteUser = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await getUserSchema.validateAsync({ user: req.params.user })
    } catch (error) {
        return res.status(400).json({ message: "Parameter validation failed", details: `${error}` });
    }

    const user = await User.findOne({ _id: validatedData.user }).exec();
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

    const comment = await Comment.find({ user: user._id }).exec();
    if (!user && !comment) {
        return res.status(404).json({ message: `None of comment, post nor user exist`})
    }

    if (comment) {
        // Delete all comments belonging to the deleted user if there are any.
        // await comment.deleteMany();
        await Comment.deleteMany({ created_by: user._id });
    }

    const deletedUser = await user.deleteOne();

    res.status(200).json({ 
                            data: {"user_id": `${deletedUser._id}`}, 
                            success: `User ${userFound.username} record deleted` 
                        });
});


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