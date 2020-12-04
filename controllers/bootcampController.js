const path = require('path');
const Bootcamp = require('../models/bootcampModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const geocoder = require('../utils/geocoder');
const factory = require('./handlerFactory');

// @desc GET ALL BOOTCAMPS

// @route GET /api/v1/bootcamps

// @access Public

exports.getAllBootcamp = factory.getAll(Bootcamp, 'courses');

// @desc GET A SINGLE BOOTCAMP

// @route GET /api/v1/bootcamps/:id

// @access Public

exports.getBootcamp = factory.getOne(Bootcamp, {
  path: 'courses',
  select: 'name description',
});

// @desc CREATE NEW BOOTCAMP

// @route POST /api/v1/bootcamps/

// @access Private

exports.createBootcamp = catchAsync(async (req, res, next) => {
  // Add user to req.body
  req.body.user = req.user.id;

  //check for public bootcamp
  const publishedBootcamp = await Bootcamp.findOne({ user: req.user.id });

  // If user is not an admin, they can only add one bootcamp
  if (publishedBootcamp && req.user.role !== 'admin') {
    return next(
      new AppError(
        `The userwith ID ${req.user.id} has already publish a bootcamp`,
        400
      )
    );
  }

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

  let bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(new AppError(`bootcamp not found with id ${id}`, 404));
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(`User ${id} is not authorized to update this bootcamp`, 401)
    );
  }
//update the bootcamp
  bootcamp = await Bootcamp.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

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
    return next(new AppError(`Bootcamp not found with id ${id}`, 404));
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(`User ${id} is not authorized to delete this bootcamp`, 401)
    );
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
    return next(
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

// @desc Upload Photo for bootcamp

// @route Put /api/v1/bootcamps/:id/photo

// @access Private

exports.bootcampPhotoUpload = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const bootcamp = await Bootcamp.findById(id);

  if (!bootcamp) {
    return next(new AppError(`Bootcamp not found with id ${id}`, 404));
  }

  // Make sure user is bootcamp owner
  if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
    return next(
      new AppError(`User ${id} is not authorized to update this bootcamp`, 401)
    );
  }

  if (!req.files) {
    return next(new AppError('Please upload a file', 400));
  }

  const file = req.files.file;

  // Make sure the image is a photo
  if (!file.mimetype.startsWith('image')) {
    return next(new AppError('Please upload an image file', 400));
  }

  // Check File Size
  if (file.size === process.env.MAX_FILE_UPLOAD) {
    return next(
      new AppError(
        `Please upload an image file less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }

  // Create Custom FileName
  file.name = `photo_${id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      console.error(error);
      return next(new AppError('Problem with file upload', 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

    res.status(200).json({
      status: 'success',
      data: file.name,
    });
  });
});
