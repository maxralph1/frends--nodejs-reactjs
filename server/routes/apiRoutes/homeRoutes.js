const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/homeController');
const verifyJWT = require('../../middlewares/verifyJWT');
const roles = require('../../config/allowed_roles');
const verifyRoles = require('../../middlewares/verifyRoles')


// router.route('/')
//     .get(homeController.homePage)
//     .get(homeController.adminPage)

router.get('/home', verifyJWT, verifyRoles(roles.level1), homeController.homePage);
router.get('/admin', homeController.adminPage);



module.exports = router;