


const homePage = async (req, res) => {
    res.json({"message": "This is the home"});
}

const adminPage = async (req, res) => {
    res.json({"message": "This is the admin"});
}


module.exports = {
    homePage,
    adminPage
}