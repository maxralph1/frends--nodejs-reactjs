require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
// const { urlencoded } = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dbConnection = require('./config/dbConnect');
const PORT = process.env.PORT || 5000;



dbConnection();

app.disable('x-powered-by');
app.use(express.json());
// app.use(urlencoded({ extended: true }));
app.use(cors());


app.use('/api', require('./routes/api'));



mongoose.connection.once('open', () => {
    console.log('Database connection established');
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});