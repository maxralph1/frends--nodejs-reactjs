const express = require('express');
const router = express.Router();
const authRouter = require('./apiRoutes/authRoutes');
const postRouter = require('./apiRoutes/postRoutes');
const userRouter = require('./apiRoutes/userRoutes');


router.use('/auth', authRouter);
router.use('/posts', postRouter);
router.use('/users', userRouter);


module.exports = router;