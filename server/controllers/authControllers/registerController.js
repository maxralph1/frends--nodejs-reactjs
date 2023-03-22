const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const sendMail = require('../../mails/sendMail');
const registerEmailConfirmMailTemplate = require('../../mails/templates/registerEmailConfirmMail');
const registerUserSchema = require('../../requestValidators/auth/registerUserValidator');


const registerUser = async (req, res) => {
    let validatedData;
    try {
        validatedData = await registerUserSchema.validateAsync({ username: req.body.username, 
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

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

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
    } else if (validatedData.account_type && validatedData.account_type == "individual", "enterprise") {
        accountType = ["level1", "level2"];
    }

    const user = await new User({
        username: validatedData.username, 
        email: validatedData.email, 
        password: hashedPassword, 
        roles: accountType, 
        email_verify_token: emailVerifyToken
    });

    user.save((error) => {
        if (error) {
            return res.status(400).json({ message: "An error occured", details: `${error}` });
        }
        res.status(201).json({ message: `User ${user.username} created` });
    });

    (async function () {
        const mailSubject = "New Account Registration";

        const mailBody = await registerEmailConfirmMailTemplate(user)
        await sendMail(process.env.EMAIL_ADDRESS, user.email, mailSubject, mailBody);
    })();

    // newAccountNotify();
};


module.exports = { registerUser };