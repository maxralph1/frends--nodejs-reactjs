const Post = require('../models/Post');
const User = require('../models/User');


const homePage = async (req, res) => {
    res.json({"message": "This is the home"});
}

const getFeedPosts = async (req, res) => {

};

const getUserProfile = async (req, res) => {

};

const adminPage = async (req, res) => {
    res.json({"message": "This is the admin"});
}


module.exports = {
    homePage,
    getFeedPosts,
    getUserProfile,
    adminPage
};