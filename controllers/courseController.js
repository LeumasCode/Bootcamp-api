const Course = require('../models/courseModel');
const Bootcamp = require('../models/bootcampModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// @desc GET ALL Courses

// @route GET /api/v1/courses
// @route GET /api/v1/bootcamp/:bootcampId/courses

// @access Public

exports.getCourses = factory.getAll(Course);

// @desc GET A single Courses

// @route GET /api/v1/courses/:id

// @access Public

exports.getACourse = factory.getOne(Course, {
  path: 'bootcamp',
  select: 'name description',
});

// @desc POST A single Courses

// @route GET /api/v1/bootcamps/:bootcampId/courses

// @access Private

exports.createCourse = catchAsync(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;
  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    next(new AppError(`No bootcamp with id of ${req.params.bootcampId}`));
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      course,
    },
  });
});
