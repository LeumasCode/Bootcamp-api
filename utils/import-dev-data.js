const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Bootcamp = require('../models/bootcampModel');
// const User = require('../../models/userModel');
const Course = require('../models/courseModel');

dotenv.config({ path: './config/config.env' });

mongoose
  .connect(process.env.DATABASE_LOCAL, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => console.log('data connect'));

//READ JSON FILE
const bootcamps = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/bootcamps.json`, 'utf-8')
);
//console.log(bootcamps);

const courses = JSON.parse(
  fs.readFileSync(`${__dirname}/../_data/courses.json`, 'utf-8')
);

// const reviews = JSON.parse(
//   fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
// );

// IMPORT THE DATA INTO DATABASE
const importData = async () => {
  try {
   //w await Bootcamp.create(bootcamps);
    // await User.create(users, { validateBeforeSave: false });
    await Course.create(courses);
    console.log('data successfully loaded');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

// Delete All from Db
const deleteData = async () => {
  try {
   // await Bootcamp.deleteMany();
    // await User.deleteMany();
    await Course.deleteMany();
    console.log('data deleted successful');
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
