const express = require('express');
const router = express.Router();
const authRouter = require('./apiRoutes/authRoutes');
const postRouter = require('./apiRoutes/postRoutes');
const userRouter = require('./apiRoutes/userRoutes');
const commentRouter = require('./apiRoutes/commentRoutes')


router.use('/auth', authRouter);
router.use('/posts', postRouter);
router.use('/users', userRouter);
router.use('/comments', commentRouter);


module.exports = router;