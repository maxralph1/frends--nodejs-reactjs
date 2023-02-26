const express = require('express');
const router = express.Router();
const authRouter = require('../routes/apiRoutes/authRoutes');
const dashboardRouter = require('./apiRoutes/dashboardRoutes');
const postRouter = require('../routes/apiroutes/postRoutes');
const userRouter = require('../routes/apiRoutes/userRoutes');


router.use('/', dashboardRouter);
router.use('/auth', authRouter);
router.use('/posts', postRouter);
router.use('/users', userRouter);


module.exports = router;