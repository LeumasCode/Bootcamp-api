const Course = require('../models/courseModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// @desc GET ALL Courses

// @route GET /api/v1/courses
// @route GET /api/v1/bootcamp/:bootcampId/courses

// @access Public

exports.getCourses = factory.getAll(Course);

exports.createCourse = factory.createOne(Course);
