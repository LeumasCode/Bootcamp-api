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
