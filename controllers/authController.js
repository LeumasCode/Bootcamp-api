const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

// @desc REGISTER USER

// @route POST /api/v1/users/register

// @access Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, passwordConfirm, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    password,
    passwordConfirm,
    role,
  });

  // create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    data: {
      user,
    },
  });
});

// @desc LOGIN USER

// @route POST /api/v1/users/login

// @access Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // validate email and password
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }
  //  check for user
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('invalid email or password', 401));
  }
  // check if password matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('invalid email or password', 401));
  }
  // create token
  const token = user.getSignedJwtToken();

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
});
