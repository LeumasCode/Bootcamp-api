const crypto = require('crypto');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

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

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  // else if (req.cookies.token) {
  //   token = req.cookies.token;
  // }

  // Make sure token exist
  if (!token) {
    return next(new AppError('Not authorized to access this route', 401));
  }

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log(decoded);
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    return next(new AppError('Not authorized to access this route', 401));
  }
});

// @desc GET CURRENT LOGGED IN USER

// @route PUT /api/v1/users/me

// @access Private

exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: 'success',
    user,
  });
});

// Grant Access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};

// @desc Forgot PASSWORD

// @route POST /api/v1/users/forgotPassword

// @access PUBLIC

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(
      new AppError(
        `User role ${req.user.role} is not authorized to access this route`,
        403
      )
    );
  }

  // Get reset Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // create resetURL
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `You are receiving this email because you (or someone else) has requestedto reset the password. Please make a PUT request to: \n\n ${resetURL}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Password Reset token',
      message,
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email',
    });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });
    return next(err);
  }
});

// @desc RESET PASSWORD

// @route PUT /api/v1/users/resetPassword:resetToken

// @access Public

exports.resetPassword = catchAsync(async (req, res, next) => {
  // Get reset token from the url
  const { resetToken } = req.params;

  // Get hashed token
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('invalid Token', 404));
  }

  // Set the password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // send Token response
  sendTokenResponse(user, 200, res);
});

// @desc UPDATE USERS DETAILS

// @route PUT /api/v1/users/updateMe

// @access Private

exports.updateMe = catchAsync(async (req, res, next) => {
  const fieldsToUpdate = {
    name: req.body.name,
    email: req.body.email,
  };
  const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    user,
  });
});

// @desc UPDATE USER PASSWORD

// @route PUT /api/v1/users/updatePassword

// @access Private

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  // current password
  if (!(await user.comparePassword(req.body.passwordCurrent.toString()))) {
    return next(new AppError('password is incorrect', 401));
  }
  // If so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // send token
  sendTokenResponse(user, 200, res);
});
