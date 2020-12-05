const mongoose = require('mongoose');
const dotenv = require('dotenv');

// colors is a package to add color to console messages. NOT IMPORTANT
const colors = require('colors');

// Global error Handler for uncaught errors e.g typing error
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! ....Shutting down...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config/config.env' });

const app = require('./app');

// const DB = process.env.DATABASE.replace(
//   '<PASSWORD>',
//   process.env.DATABASE_PASSWORD
// );

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    autoIndex: true,
  })
  .then(() => console.log('Db connected'.cyan.underline.bold));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () =>
  console.log(`server running on port ${PORT}`.yellow.bold)
);

// Global error Handler for unhandled Rejection errors
process.on('unhandledRejection', (err) => {
  console.log('UNHANDLED REJECTION ....Shutting down...'.red);
  console.log(err.name, err.message);
  // Close server && exit process
  server.close(() => {
    process.exit(1);
  });
});
