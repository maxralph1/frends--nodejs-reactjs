const asyncHandler = require('express-async-handler');
const User = require('../../models/User');
const loginUserSchema = require('../../requestValidators/auth/loginUserValidator');
const generateToken = require('../../utils/generateToken');


// @desc   Auth user & get token
// @route  POST /api/v1/auth/login
// @access Public
const loginUser = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await loginUserSchema.validateAsync({ username_email: req.body.username_email, 
                                                            password: req.body.password });
    } catch (error) {
        return res.status(400).json({ message: "Validation failed", details: `${error}` });
    }

    const user = await User.findOne({$or: [{username: validatedData.username_email}, {email: validatedData.username_email}]}).exec();

    if (!user?.active) return res.status(401).json({ message: "Unauthorized" });

    if (!user.email_verified) return res.status(401).json({ message: "You must verify your email before you can login." })

    if (user) { 
        user.online = true;
        user.last_time_active = '';
    }

    if (user && (await user.matchPassword(validatedData.password))) {
        generateToken(res, user._id);

        user.save((error) => {
            if (error) {
                return res.status(400).json(error);
            }
        });

        res.json({
            _id: user._id, 
            username: user.username, 
            first_name: user.first_name, 
            other_names: user.other_names, 
            last_name: user.last_name, 
            email: user.email, 
            occupation: user.occupation,
            location: user.location,
            show_friends: user.show_friends, 
            account_type: user.roles, 
            profile_image: user.profile_image,
            wallpaper_image: user.wallpaper_image,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});


module.exports = { loginUser };