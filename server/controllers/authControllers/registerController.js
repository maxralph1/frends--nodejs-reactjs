const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');
const sendMail = require('../../mailers/sendMail')


const registerUser = async (req, res) => {
    const { username, email, password, type } = req.body;

    const duplicateUser = await User.findOne({ username }).exec();
    if (duplicateUser) {
        return res.status(409).json({ "message": `User ${duplicateUser.username} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailVerifyToken = jwt.sign(
        { "username": req.body.username }, 
        process.env.EMAIL_VERIFY_TOKEN_SECRET, 
        { expiresIn: 120 * 60 }
    );

    const user = await new User({
        username, email, password: hashedPassword, roles: type, email_verify_token: emailVerifyToken
    });

    user.save((err) => {
        if (err) {
            return res.status(400).json(err);
        }

        res.status(201).json({ "message": `User ${user.username} created` });
    });

    (async function () {
        const mailSubject = "New Account Registration";

        const mailBody = `
        <html>
        <h1>You just created a new account with us</h1>
        
        <p>Click on the following <a href="${process.env.BASE_URL}/api/auth/verify-email/${user.username}/${user.email_verify_token}">link</a> to verify your email.</p>

        <p>Please note that this link expires in 120 minutes.</p>
        </html>
        `;
        await sendMail(process.env.EMAIL_ADDRESS, user.email, mailSubject, mailBody);
    })();

    // newAccountNotify();
};


module.exports = { registerUser };