const jwt = require('jsonwebtoken');
const User = require('../../models/User');


// @desc    Logout user / clear cookie
// @route   POST /api/v1/auth/logout
// @access  Public
const logoutUser = async (req, res) => {

    const cookies = req.cookies;

    if (!cookies?.jwt) return res.sendStatus(204);

    try {
        const decoded = jwt.verify(req?.cookies?.jwt, process.env.JWT_SECRET);

        let user = await User.findById(decoded.userId).exec();

        if (user) { 
            user.online = false;
            user.last_time_active = new Date().toISOString();
        }

        await user.save();
    } catch (error) {
        console.error(error);
        res.status(401);
        throw new Error('Not authorized, token failed');
    }
    

    res.clearCookie('jwt', { 
        httpOnly: true, 
        sameSite: 'None', 
        secure: false 
    });
    // res.clearCookie('jwt', { httpOnly: true, secure: true, sameSite: 'None' });

    res.json({ message: "Logged out successfully" });
};


module.exports = { logoutUser };