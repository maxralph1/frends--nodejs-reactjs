const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const loginUser = async (req, res) => {
    const { username, password } = req.body;

    const userFound = await User.findOne({ username }).exec();

    if (!userFound) return res.status(401).json({ "message": "Access denied. Check your credentials" });

    // password = password.trim()
    const match = await bcrypt.compare(password, userFound.password);

    if (match) {
        const roles = Object.values(userFound.roles)
        const accessToken = jwt.sign(
            // {"username": userFound.username},
            {
                "userInfo": {
                    "username": userFound.username,
                    "roles": roles
                }
            }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: 5 * 60 }
        );
        const refreshToken = jwt.sign(
            {"username": userFound.username}, 
            process.env.REFRESH_TOKEN_SECRET, 
            { expiresIn: 10 * 60 }
        );

        userFound.refresh_token = refreshToken;

        const result = await userFound.save();
        res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });

        res.json({ roles, accessToken });
    } else {
        return res.status(401).json({ "message": "Access denied" });
    }
};


module.exports = { loginUser };