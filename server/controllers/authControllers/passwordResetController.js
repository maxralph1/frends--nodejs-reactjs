const jwt = require('jsonwebtoken');
// const crypto = require("crypto");
const bcrypt = require('bcrypt');
const User = require('../../models/User');
// const Token = require('../../models/Token');
const sendMail = require('../../mailers/sendMail');


const mailPasswordResetLink = async (req, res) => {
    try {
        // const schema = Joi.object({ email: Joi.string().email().required() });
        // const { error } = schema.validate(req.body);
        // if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email }).exec();
        if (!user) return res.status(400).send("user with given email doesn't exist");  //perhaps, consider replacing this
        
        const passwordResetToken = jwt.sign(
            { "username": user.username }, 
            process.env.PASSWORD_RESET_TOKEN_SECRET, 
            { expiresIn: 10 * 60 }
        );

        user.password_reset_token = passwordResetToken;
        // user.password_reset_token = crypto.randomBytes(32).toString("hex");
        // if (!user.password_reset_token) {
        //     user.password_reset_token = crypto.randomBytes(32).toString("hex");
        // } else {
        //     let oldToken = user.password_reset_token;
        //     oldToken.delete();
        //     user.password_reset_token = crypto.randomBytes(32).toString("hex");
        // }

        await user.save();

        // let token = await Token.findOne({ userId: user._id });
        // if (!token) {
        //     token = await new Token({
        //         userId: user._id,
        //         token: crypto.randomBytes(32).toString("hex"),
        //     }).save();
        // }

        const mailSubject = "Password Reset Request Link";

        const mailBody = `
        <html>
        <h1>Password reset message</h1>
        
        <p>Click on the following <a href="${process.env.BASE_URL}/api/auth/password-reset/${user.username}/${user.password_reset_token}">link</a> to reset your password.</p>

        <p>Please note that this link expires in 10 minutes.</p>
        </html>
        `;
        await sendMail(process.env.EMAIL_ADDRESS, user.email, mailSubject, mailBody);

        res.send("Password reset link has been sent to your email");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
};



const verifyMailedPasswordResetLink = async (req, res) => {
    try {
        // const schema = Joi.object({ password: Joi.string().required() });
        // const { error } = schema.validate(req.body);
        // if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ username: req.params.username, password_reset_token: req.params.token }).exec();
        if (!user) return res.status(400).send("invalid/expired link");

        try {
            jwt.verify(user.password_reset_token, process.env.PASSWORD_RESET_TOKEN_SECRET);
        } catch(err) {
            return res.status(400).send("verification failed");
        }

        // if (!token) return res.status(400).send("Invalid/expired link");

        // if (decodedUsername) res.status(400).send("invalid/expired link 2");




        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        user.password = hashedPassword;
        user.password_reset_token = '';

        await user.save();

        

        // await user.password_reset_token.delete();

        res.send("password reset sucessfully.");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
};



module.exports = { mailPasswordResetLink, verifyMailedPasswordResetLink };

