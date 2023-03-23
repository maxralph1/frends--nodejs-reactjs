const express = require('express');
const router = express.Router();
const authenticated = require('../../middleware/authenticated');
const roles = require('../../config/allowedRoles');
const checkRoles = require('../../middleware/checkRoles');
const commentController = require('../../controllers/commentController');


router.post('/posts/:post', authenticated, commentController.commentOnPost);

router.route('/:comment/posts/:post')
        .patch(authenticated, commentController.updateCommentOnPost)
        .put(authenticated, commentController.softDeleteCommentOnPost);

router.post('/users/:user', authenticated, commentController.commentOnUser);

router.route('/:comment/users/:user')
        .post(authenticated, commentController.commentOnUser)
        .patch(authenticated, commentController.updateCommentOnUser)
        .put(authenticated, commentController.softDeleteCommentOnUser);

router.route('/:comment/reaction')
        .put(authenticated, commentController.reactOnUserComment)
        .patch(authenticated, commentController.reactOnPostComment)

router.patch('/:comment/undelete', authenticated, checkRoles(roles.admin), commentController.undeleteSoftDeletedComment);

router.delete('/:comment/delete', authenticated, checkRoles(roles.admin),  commentController.deleteComment);


module.exports = router;