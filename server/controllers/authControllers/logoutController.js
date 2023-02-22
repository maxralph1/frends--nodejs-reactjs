const User = require('../../models/User');


const logoutUser = async (req, res) => {
    // console.log(req.cookies)
    const cookies = req.cookies;
    // console.log(cookies);
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    const userFound = await User.findOne({ refresh_token: refreshToken }).exec();

    if (!userFound) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    };

    // userFound.refresh_token = '';
    userFound.refresh_token = userFound.refresh_token.filter(rt => rt !== refreshToken);
    await userFound.save();
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    console.log("end");
    res.sendStatus(204);
};


module.exports = { logoutUser };