const User = require('../../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');


const loginUser = async (req, res) => {
    const cookies = req.cookies;
    const { username, password } = req.body;

    const userFound = await User.findOne({ username }).exec();

    if (!userFound) return res.status(401).json({ "message": "Access denied. Check your credentials" });

    const match = await bcrypt.compare(password, userFound.password);

    if (match) {
        const roles = Object.values(userFound.roles);
        const accessToken = jwt.sign(
            {
                "userInfo": {
                    "username": userFound.username,
                    "roles": roles
                }
            }, 
            process.env.ACCESS_TOKEN_SECRET, 
            { expiresIn: 5 * 60 }
        );
        const newRefreshToken = jwt.sign(
            { "username": userFound.username }, 
            process.env.REFRESH_TOKEN_SECRET, 
            { expiresIn: 15 * 60 }
        );

        let newRefreshTokenArray = 
            !cookies?.jwt 
                ? userFound.refresh_token
                : userFound.refresh_token.filter(rt => rt !== cookies.jwt);

        if (cookies?.jwt) {
            const refreshToken = cookies.jwt;
            const tokenFound = await User.findOne({ refresh_token: refreshToken }).exec();

            if (!tokenFound) {
                newRefreshTokenArray = [];
            }

            res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        }

        userFound.refresh_token = [...newRefreshTokenArray, newRefreshToken];

        const result = await userFound.save();
        
        res.cookie('jwt', newRefreshToken, { httpOnly: true, sameSite: 'None', secure: true, maxAge: 24 * 60 * 60 * 1000 });

        res.json({ roles, accessToken });
    } else {
        return res.status(401).json({ "message": "Access denied" });
    }
};


module.exports = { loginUser };