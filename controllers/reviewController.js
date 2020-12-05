const Bootcamp = require('../models/bootcampModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const Review = require('../models/reviewModel');

// @desc GET ALL Reviews

// @route GET /api/v1/courses
// @route GET /api/v1/bootcamp/:bootcampId/reviews

// @access Public

exports.getReviews = factory.getAll(Review, {
  path: 'bootcamp',
  select: 'name description',
});

// @desc GET a Single Reviews
// @route GET /api/v1/reviews/:id
// @access Public

exports.getReview = factory.getOne(Review, {
  path: 'bootcamp',
  select: 'name description',
});

// @desc CREATE a  Review
// @route GET /api/v1/bootcamps/:bootcampId/reviews
// @access Private

exports.createReview = catchAsync(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  req.body.user = req.user.id;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    return next(
      new AppError(`No bootcamp with id of ${req.params.bootcampId}`)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// @desc UPDATE a  Review
// @route PUT /api/v1/reviews/:id
// @access Private

exports.updateReview = catchAsync(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError(`No bootcamp with id of ${req.params.id}`));
  }

  // Make sure review belong to the user or user is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`Not authorize to update the review`));
  }

  review = await Review.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      review,
    },
  });
});

// @desc DELETE a  Review
// @route DELETE /api/v1/reviews/:id
// @access Private

exports.deleteReview = catchAsync(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError(`No bootcamp with id of ${req.params.id}`));
  }

  // Make sure review belong to the user or user is an admin
  if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(new AppError(`Not authorize to update the review`));
  }

  await Review.remove();

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
