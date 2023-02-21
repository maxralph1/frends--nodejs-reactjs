const express = require('express');
const router = express.Router();


const authRouter = require('../routes/apiRoutes/authRoutes');
const homeRouter = require('../routes/apiRoutes/homeRoutes');

router.use('/', homeRouter);
router.use('/auth', authRouter)




module.exports = router;