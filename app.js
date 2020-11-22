const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
// route files
const bootcampRoute = require('./routes/bootcampRoutes');

const globalErrorHandler = require('./controllers/errorControllers');

const app = express();
// use the express body-parser
app.use(express.json());

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use('/api/v1/bootcamps', bootcampRoute);

app.use(globalErrorHandler);

module.exports = app;
