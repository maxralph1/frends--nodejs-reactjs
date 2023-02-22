const User = require('../../models/User');
const jwt = require('jsonwebtoken');


const refreshTokenHandler = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);
    const refreshToken = cookies.jwt;
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });

    const userFound = await User.findOne({ refresh_token: refreshToken }).exec();

    if (!userFound) {
        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err) return res.sendStatus(403);
                const compromisedUser = await User.findOne({ username: decoded.username }).exec();
                compromisedUser.refresh_token = [];
                // At this stage, implement an automated email notification to inform the owner that their account has likely been compromised and that they should consider resetting their password
                await compromisedUser.save();
            }
        )
        return res.sendStatus(403);
    }

    const newRefreshTokenArray = userFound.refresh_token.filter(rt => rt !== refreshToken);

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) {
                userFound.refresh_token = [...newRefreshTokenArray];
                await userFound.save();
            }
            if (err || userFound.username !== decoded.username) return res.sendStatus(403);

            const roles = Object.values(userFound.roles);
            const accessToken = jwt.sign(
                {
                    "userInfo": {
                        "username": decoded.username,
                        "roles": roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: 5 * 60 }
            );

            const newRefreshToken = jwt.sign(
                { "username": userFound.username },
                process.env.REFRESH_TOKEN_SECRET,
                { expiresIn: 20 * 60 }
            );

            userFound.refresh_token = [...newRefreshTokenArray, newRefreshToken];
            await userFound.save();

            res.cookie('jwt', newRefreshToken, { httpOnly: true, secure: true, sameSite: 'None', maxAge: 24 * 60 * 60 *1000 });

            res.json({ roles, accessToken })
        }
    );
}

module.exports = { refreshTokenHandler }