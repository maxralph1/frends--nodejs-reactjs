const express = require('express');
const router = express.Router();
const registerController = require('../../controllers/authControllers/registerController');
const verifyEmailController = require('../../controllers/authControllers/verifyEmailController');
const loginController = require('../../controllers/authControllers/loginController');
const profileController = require('../../controllers/authControllers/profileController');
const authenticated = require('../../middleware/authenticated');
const logoutController = require('../../controllers/authControllers/logoutController');
const passwordResetController = require('../../controllers/authControllers/passwordResetController');
const loginLimiter = require('../../middleware/loginLimiter')


router.post('/register', registerController.registerUser);
router.post('/verify-email/:username/:token', verifyEmailController.verifyMailLinkAuthenticate);
router.post('/login', loginLimiter, loginController.loginUser);
router.route('/my-profile')
        .get(authenticated, profileController.getAuthUserProfile)
        .put(authenticated, profileController.updateAuthUserProfile);
router.post('/logout', logoutController.logoutUser);
router.post('/password-reset', passwordResetController.mailPasswordResetLink);
router.post('/password-reset/:username/:token', passwordResetController.verifyMailedPasswordResetLink);


module.exports = router;