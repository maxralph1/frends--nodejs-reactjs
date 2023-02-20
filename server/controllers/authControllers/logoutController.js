const User = require('../../models/User');


const logoutUser = async (req, res) => {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);
    const refreshToken = cookies.jwt;

    const userFound = await User.findOne({ refresh_token: refreshToken }).exec();

    if (!userFound) {
        res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
        return res.sendStatus(204);
    };

    userFound.refresh_token = '';
    const result = await userFound.save();
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'None', secure: true });
    res.status(204).json(result);
};


module.exports = { logoutUser };