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
