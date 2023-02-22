require('dotenv').config();
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('./config/corsOptions');
const credentials = require('./middlewares/credentials');
const mongoose = require('mongoose');
const dbConnection = require('./config/dbConnect');
const PORT = process.env.PORT || 5000;



dbConnection();

// app.disable('x-powered-by');
app.use(express.json());
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// app.use('/refresh-token', require('./routes/refreshTokenRoute'));
app.use('/api', require('./routes/api'));



mongoose.connection.once('open', () => {
    console.log('Database connection established');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});