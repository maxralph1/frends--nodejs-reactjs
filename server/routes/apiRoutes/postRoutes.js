const express = require('express');
const router = express.Router();
const authenticated = require('../../middleware/authenticated');
const roles = require('../../config/allowedRoles');
const checkRoles = require('../../middleware/checkRoles');
const postController = require('../../controllers/postController');


router.route('/')
        .get(postController.getAllPosts)
        .post(authenticated, postController.createPost);

router.get('/my-posts', authenticated, postController.getAuthUserPosts);

router.route('/:post')
        .get(postController.getPost)
        .patch(authenticated, postController.updatePost)
        .put(authenticated, checkRoles(roles.admin), postController.updatePostAdminAccess)
        .delete(authenticated, checkRoles(roles.admin), postController.deletePost);

router.get('/user/:user', postController.getUserPosts);

router.patch('/:post/reaction', authenticated, postController.reactOnPost);

router.patch('/:post/images/:image', postController.updateImageOnPost);

router.patch('/:post/delete', authenticated, postController.softDeletePost);

router.patch('/:post/undelete', authenticated, checkRoles(roles.admin), postController.undeleteSoftDeletedPost)


module.exports = router;