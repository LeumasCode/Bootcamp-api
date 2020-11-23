const Bootcamp = require('../models/bootcampModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const geocoder = require('../utils/geocoder');
const factory = require('./handlerFactory');

// @desc GET ALL BOOTCAMPS

// @route GET /api/v1/bootcamps

// @access Public

exports.getAllBootcamp = factory.getAll(Bootcamp);

// @desc GET A SINGLE BOOTCAMP

// @route GET /api/v1/bootcamps/:id

// @access Public

exports.getBootcamp = factory.getOne(Bootcamp, {path: 'courses', select: 'name description'});

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
  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    next(new AppError(`Bootcamp not found with id ${id}`, 404));
  }

  bootcamp.remove();

  res.status(204).json({
    status: 'success',
    message: null,
  });
});

// @desc GET BOOTCAMPS WITHIN A RADIUS

// @route GET /api/v1/bootcamps/radius/:zipcode/:distance/:unit

// @access Public

exports.getBootcampWithin = catchAsync(async (req, res, next) => {
  const { zipcode, distance, unit } = req.params;

  // Get lat/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;

  // calculate the radius
  // Divide the Distance by radius of the Earth
  // Earth radius in miles = 3963.2mi and in km= 6378.1km
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;

  if (!lat || !lng) {
    next(
      new AppError(
        'Please provide latitude and longitude in format lat, lng.',
        400
      )
    );
  }

  const bootcamp = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
  });

  res.status(200).json({
    status: 'success',
    result: bootcamp.length,
    data: {
      bootcamp,
    },
  });
});
