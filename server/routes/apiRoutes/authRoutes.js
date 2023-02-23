const express = require('express');
const router = express.Router();
const registerController = require('../../controllers/authControllers/registerController');
const verifyEmailController = require('../../controllers/authControllers/verifyEmailController');
const loginController = require('../../controllers/authControllers/loginController');
const logoutController = require('../../controllers/authControllers/logoutController');
const passwordResetController = require('../../controllers/authControllers/passwordResetController')


router.post('/register', registerController.registerUser);
router.post('/verify-email/:username/:token', verifyEmailController.verifyMailLinkAuthenticate);
router.get('/logout', logoutController.logoutUser);
router.post('/login', loginController.loginUser);
router.post('/password-reset', passwordResetController.mailPasswordResetLink);
router.post('/password-reset/:username/:token', passwordResetController.verifyMailedPasswordResetLink);



module.exports = router;