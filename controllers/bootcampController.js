const Bootcamp = require('../models/bootcampModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
// @desc GET ALL BOOTCAMPS

// @route GET /api/v1/bootcamps

// @access Public

exports.getAllBootcamp = catchAsync(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();

  res.status(200).json({
    status: 'success',
    result: bootcamps.length,
    data: {
      bootcamps,
    },
  });
});

// @desc GET A SINGLE BOOTCAMP

// @route GET /api/v1/bootcamps/:id

// @access Public

exports.getBootcamp = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findById(id);
  if (!bootcamp)
    return next(new AppError(`bootcamp not found with id ${id}`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      bootcamp,
    },
  });
});

// @desc CREATE NEW BOOTCAMP

// @route POST /api/v1/bootcamps/

// @access Private

exports.createBootcamp = catchAsync(async (req, res, next) => {
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      bootcamp,
    },
  });
});

// @desc UPDATE A SINGLE BOOTCAMP

// @route PUT /api/v1/bootcamps/:id

// @access Private

exports.updateBootcamp = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp)
    return next(new AppError(`bootcamp not found with id ${id}`, 404));

  res.status(200).json({
    status: 'success',
    data: {
      bootcamp,
    },
  });
});

// @desc DELETE A SINGLE BOOTCAMP

// @route DELETE /api/v1/bootcamps/:id

// @access Private

exports.deleteBootcamp = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Bootcamp.findByIdAndDelete(id);

  res.status(204).json({
    status: 'success',
    message: null,
  });
});
