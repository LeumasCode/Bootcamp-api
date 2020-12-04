const Course = require('../models/courseModel');
const Bootcamp = require('../models/bootcampModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

// @desc GET ALL Courses

// @route GET /api/v1/courses
// @route GET /api/v1/bootcamp/:bootcampId/courses

// @access Public

exports.getCourses = factory.getAll(Course, {
  path: 'bootcamp',
  select: 'name description',
});

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

  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    next(new AppError(`No bootcamp with id of ${req.params.bootcampId}`));
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
        `User ${req.user.id} is not authorized to add a course to bootamp ${bootcamp._id}`,
        401
      )
    );
  }

  const course = await Course.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      course,
    },
  });
});

// @desc UPDATE A single Courses

// @route PUT /api/v1/courses/:id

// @access Private

exports.updateCourse = catchAsync(async (req, res, next) => {
  let course = await Course.findById(req.params.id);

  if (!course) {
    return next(new AppError(`no course with id ${req.params.id}, 404`));
  }

  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
        `User ${req.user.id} is not authorized to update course ${course._id}`,
        401
      )
    );
  }
  course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      course,
    },
  });
});

// @desc Delete A single Courses

// @route Delete /api/v1/courses/:id

// @access Private

exports.deleteCourse = catchAsync(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    next(new AppError(`No course with id of ${req.params.id}`));
  }
  // Make sure user is course owner
  if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(
        `User ${req.user.id} is not authorized to delete course ${course._id}`,
        401
      )
    );
  }

  await course.remove();

  res.status(204).json({
    status: 'success',
    data: {},
  });
});
