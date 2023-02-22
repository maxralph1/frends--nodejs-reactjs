const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/homeController');
const authenticated = require('../../middlewares/authenticated');
const roles = require('../../config/allowedRoles');
const checkRoles = require('../../middlewares/checkRoles')


// router.route('/')
//     .get(homeController.homePage)
//     .get(homeController.adminPage)

router.get('/home', authenticated, checkRoles(roles.level1), homeController.homePage);
router.get('/admin', homeController.adminPage);



module.exports = router;