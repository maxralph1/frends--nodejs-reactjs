const User = require('../../models/User');
const bcrypt = require('bcrypt');


const registerUser = async (req, res) => {
    const { username, password, type } = req.body;

    const duplicateUser = await User.findOne({ username }).exec();
    if (duplicateUser) {
        return res.status(409).json({ "message": `User ${duplicateUser.username} already exists` });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await new User({
        username, password: hashedPassword, roles: type
    });

    user.save((err) => {
        if (err) {
            return res.status(400).json(err);
        }
        res.status(201).json({ "message": `User ${user.username} created` });
    });
};


module.exports = { registerUser }