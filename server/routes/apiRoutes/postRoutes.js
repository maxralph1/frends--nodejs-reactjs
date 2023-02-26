const express = require('express');
const router = express.Router();
const postController = require('../../controllers/postController');
const authenticated = require('../../middlewares/authenticated');
// const roles = require('../../config/allowedRoles');
// const checkRoles = require('../../middlewares/checkRoles');


router.route('/')
        .get(postController.getAllPosts)
        .post(authenticated, postController.createPost);

router.route('/:post')
        .get(postController.getPost)
        .patch(authenticated, postController.softDeletePost);

router.route('/:id', authenticated)
        .put(postController.updatePost)
        .patch(postController.likePost)
        .delete(postController.deletePost);

router.get('/:username', authenticated, postController.getUserPosts);


module.exports = router;