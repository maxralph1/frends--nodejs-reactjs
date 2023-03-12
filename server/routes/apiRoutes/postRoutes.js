const express = require('express');
const router = express.Router();
const authenticated = require('../../middleware/authenticated');
// const roles = require('../../config/allowedRoles');
// const checkRoles = require('../../middleware/checkRoles');
const postController = require('../../controllers/postController');


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

router.get('/:username/posts', postController.getUserPosts);


module.exports = router;