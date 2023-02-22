const crypto = require("crypto");
const User = require('../../models/User');
const Token = require('../../models/Token');
const resetPasswordMail = require('../../mailers/resetPasswordMail');


const mailPasswordResetLink = async (req, res) => {
    try {
        // const schema = Joi.object({ email: Joi.string().email().required() });
        // const { error } = schema.validate(req.body);
        // if (error) return res.status(400).send(error.details[0].message);

        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(400).send("user with given email doesn't exist");  //perhaps, consider replacing this 

        let token = await Token.findOne({ userId: user._id });
        if (!token) {
            token = await new Token({
                userId: user._id,
                token: crypto.randomBytes(32).toString("hex"),
            }).save();
        }

        const link = `${process.env.BASE_URL}/password-reset/${user._id}/${token.token}`;
        await resetPasswordMail(user.email, "Password reset", link);

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

        const user = await User.findById(req.params.userId);
        if (!user) return res.status(400).send("invalid/expired link");

        const token = await Token.findOne({
            userId: user._id,
            token: req.params.token,
        });
        if (!token) return res.status(400).send("Invalid link or expired");

        user.password = req.body.password;
        await user.save();
        await token.delete();

        res.send("password reset sucessfully.");
    } catch (error) {
        res.send("An error occured");
        console.log(error);
    }
};



module.exports = { mailPasswordResetLink, verifyMailedPasswordResetLink };

