const asyncHandler = require('express-async-handler');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const registerUserSchema = require('../../requestValidators/auth/registerUserValidator');
const registerEmailConfirmMailTemplate = require('../../mails/templates/registerEmailConfirmMail');
const sendMail = require('../../mails/sendMail');


/**
 * @apiGroup Auth
 * @apiPermission public
 * @api {post} /api/v1/auth/register Register User
 * @apiName RegisterUser
 * 
 * @apiDescription This registers a new user.
 * 
 * @apiBody {String} first_name       First name of the user.
 * @apiBody {String} last_name       Last name of the user.
 * @apiBody {String} username       Username of the user.
 * @apiBody {String} email       Email of the user.
 * @apiBody {String} password          Password of the user.
 * @apiBody {String} account_type          Account type of the user.
 * @apiExample {json} Request Body:
 *     {
 *       "first_name": "John",
 *       "last_name": "Snow",
 *       "username": "testinguser1",
 *       "username": "johnsnow@email.com",
 *       "password": "testinguserpassword",
 *       "accoiunt_type": "individual",
 *     }
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 201 Created
 *     {
 *       "success": `User ... created. A confirmation link has been sent to your email.`
 *     }
 * 
 * @apiError LoginErrors Possible error messages.
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 400 Validation Failed
 *     {
 *       "message": "Validation failed.",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 401 Unauthorized
 *     {
 *       "message": "An error occured",
 *       "details": "..."
 *     }
 * 
 *     HTTP/1.1 409 Conflict
 *     {
 *       "message": "User email ... already exists"
 *     }
 */
const registerUser = asyncHandler(async (req, res) => {
    let validatedData;
    try {
        validatedData = await registerUserSchema.validateAsync({ first_name: req.body.first_name, 
                                                                last_name: req.body.last_name,
                                                                username: req.body.username, 
                                                                email: req.body.email,
                                                                password: req.body.password,
                                                                account_type: req.body.account_type });
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

    // const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const emailVerifyToken = jwt.sign(
        { "username": req.body.username }, 
        process.env.EMAIL_VERIFY_TOKEN_SECRET, 
        { expiresIn: 20 * 60 }
    );

    let accountType;

    if (!validatedData.account_type) {
        accountType = ["level1"];
    } else if (validatedData.account_type && validatedData.account_type == "individual") {
        accountType = ["level1"];
    } else if (validatedData.account_type && validatedData.account_type == "enterprise") {
        accountType = ["level2"];
    }

    const user = await new User({
        first_name: validatedData.first_name, 
        last_name: validatedData.last_name, 
        username: validatedData.username, 
        email: validatedData.email, 
        password: validatedData.password, 
        roles: accountType, 
        email_verify_token: emailVerifyToken, 
        followers: {}
    });

    user.save((error) => {
        if (error) {
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(201).json({ success: `User ${user.username} created. A confirmation link has been sent to your email.` });
    });

    (async function () {
        const mailSubject = "New Account Registration";

        const mailBody = await registerEmailConfirmMailTemplate(user)
        await sendMail(process.env.EMAIL_ADDRESS, user.email, mailSubject, mailBody);
    })();

    // newAccountNotify();
});


module.exports = { registerUser };