const User = require('../models/User');


const getAllUsers = async (req, res) => {
    const users = await User.find().sort('-created_at');
    if (!users) return res.status(404).json({ "message": "No users found" });
    res.json(users);
};

const getUser = async (req, res) => {
    if (!req?.params?.username) return res.status(400).json({ "message": "Username required" });
    const { username } = req.params;
    const user = await User.findOne({ username }).exec();
    if (!user) {
        return res.status(404).json({ "message": `No user matches ${req.params.username}` });
    }
    res.json(user);
};

const getUserFriends = async (req, res) => {
    const { id } = req.params;
    
};

const createUser = async (req, res) => {

};

const updateUser = async (req, res) => {

};

const addRemoveFriend = async (req, res) => {

};

const deleteUser = async (req, res) => {

};


module.exports = {
    getAllUsers,
    getUser,
    getUserFriends,
    createUser,
    updateUser,
    addRemoveFriend,
    deleteUser
}