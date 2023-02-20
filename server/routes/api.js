const express = require('express');
const router = express.Router();


const authRouter = require('../routes/apiRoutes/authRoutes');
const homeRouter = require('../routes/apiRoutes/homeRoutes');


router.use('/auth', authRouter)
router.use('/', homeRouter);



module.exports = router;