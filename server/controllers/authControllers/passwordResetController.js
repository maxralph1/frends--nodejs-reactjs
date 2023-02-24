const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const sendMail = require('../../mails/sendMail');
const passwordResetMailTemplate = require('../../mails/templates/passwordResetMail');


const mailPasswordResetLink = async (req, res) => {
    try {
        // const schema = Joi.object({ email: Joi.string().email().required() });
        // const { error } = schema.validate(req.body);
        // if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email }).exec();
        if (!user) return res.status(400).json({ "message": "Password reset link has been sent to your email if you have an account with us" });  // although this stops the process and does not send a verification email, it is done for security purposes in order not to expose to the potential harmful user, the existence of an account. We could consider removing the laat line, "if you have an account with us"
        
        const passwordResetToken = jwt.sign(
            { "username": user.username }, 
            process.env.PASSWORD_RESET_TOKEN_SECRET, 
            { expiresIn: 10 * 60 }
        );

        user.password_reset_token = passwordResetToken;
        await user.save();

        const mailSubject = "Password Reset Request Link";

        const mailBody = passwordResetMailTemplate(user);
        await sendMail(process.env.EMAIL_ADDRESS, user.email, mailSubject, mailBody);

        res.status(200).json({ "message": "Password reset link has been sent to your email" });
    } catch (error) {
        res.status(400).json({ "message": "An error occured", "details": `${error}` });
    }
};



const verifyMailedPasswordResetLink = async (req, res) => {
    try {
        // const schema = Joi.object({ password: Joi.string().required() });
        // const { error } = schema.validate(req.body);
        // if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ username: req.params.username, password_reset_token: req.params.token }).exec();
        if (!user) return res.status(400).json({ "message": "Invalid/expired link" });

        try {
            jwt.verify(user.password_reset_token, process.env.PASSWORD_RESET_TOKEN_SECRET);
        } catch(error) {
            return res.status(400).json({ "message": "Invalid/expired link", "details": `${error}` });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        user.password = hashedPassword;
        user.password_reset_token = '';
        await user.save();

        res.json({ "message": "Password reset sucessfully" });
    } catch (error) {
        res.status(400).json({ "message": "An error occured", "details": `${error}` });
    }
};



module.exports = { mailPasswordResetLink, verifyMailedPasswordResetLink };

