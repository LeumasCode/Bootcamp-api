const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const fileUpload = require('express-fileupload');
// route files
const bootcampRoute = require('./routes/bootcampRoutes');
const courseRoute = require('./routes/courseRoutes');
const userRoute = require('./routes/userRoutes');

const globalErrorHandler = require('./controllers/errorControllers');

const app = express();
// use the express body-parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// File Uploading
app.use(fileUpload());

// Set static folder
app.use(express.static(path.join(__dirname, 'public')));

// Mount Routes
app.use('/api/v1/bootcamps', bootcampRoute);
app.use('/api/v1/courses', courseRoute);
app.use('/api/v1/users', userRoute);

app.use(globalErrorHandler);

module.exports = app;
