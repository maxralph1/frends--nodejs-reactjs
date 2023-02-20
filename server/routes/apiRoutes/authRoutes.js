const express = require('express');
const router = express.Router();
const registerController = require('../../controllers/authControllers/registerController');
const loginController = require('../../controllers/authControllers/loginController');
const logoutController = require('../../controllers/authControllers/logoutController');


router.post('/register', registerController.registerUser)
router.post('/login', loginController.loginUser);
router.get('/logout', logoutController.logoutUser);


module.exports = router;