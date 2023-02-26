const express = require('express');
const router = express.Router();
const homeController = require('../../controllers/homeController');
const authenticated = require('../../middlewares/authenticated');
const roles = require('../../config/allowedRoles');
const checkRoles = require('../../middlewares/checkRoles')


router.get('/home', authenticated, checkRoles(roles.level1), homeController.homePage);
router.get('/admin', authenticated, checkRoles(roles.level3),  homeController.adminPage);


module.exports = router;