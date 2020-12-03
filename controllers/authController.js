const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

// Get Token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') options.secure = true;

  res.status(statusCode).cookie('token', token, options).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

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
  sendTokenResponse(user, 201, res);
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
  sendTokenResponse(user, 201, res);
});
