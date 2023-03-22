const express = require('express');
const router = express.Router();
const userController = require('../../controllers/userController');
const authenticated = require('../../middleware/authenticated');
const roles = require('../../config/allowedRoles');
const checkRoles = require('../../middleware/checkRoles')


router.route('/')
        .get(authenticated, checkRoles(roles.admin), userController.getAllUsers)
        .post(authenticated, checkRoles(roles.admin), userController.createUser);

router.get('/search/:searchKey', userController.searchUsers);

router.route('/:user')
        .get(userController.getUser)
        .patch(authenticated, userController.updateUser)
        .put(authenticated, checkRoles(roles.admin), userController.updateUserAdminAccess)
        .delete(authenticated, checkRoles(roles.admin), userController.deleteUser);

router.get('/:user/friends', userController.getUserFriends);

router.patch('/:user/delete', authenticated, userController.softDeleteUser);

router.patch('/:user/re-activate', authenticated, checkRoles(roles.admin), userController.reactivateSoftDeletedUser);

router.patch('/:userId/friend/:friendId', authenticated, userController.addRemoveFriend);


module.exports = router;