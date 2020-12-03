const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

// @desc REGISTER USER

// @route POST /api/v1/users/register

// @access Public
exports.register = catchAsync((req, res, next) => {
  res.status(200).json({
    success: true,
  });
});
