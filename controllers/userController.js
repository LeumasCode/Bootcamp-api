const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const factory = require('./handlerFactory');

// @desc GET ALL USERS

// @route GET /api/v1/users

// @access Private/admin
exports.getUsers = factory.getAll(User);

// @desc GET SINGLE USER

// @route GET /api/v1/users/id

// @access Private/admin
exports.getUser = factory.getOne(User);

// @desc CREATE A USER

// @route POST /api/v1/users

// @access Private/admin
exports.createUser = factory.createOne(User);

// @desc UPDATE A USER

// @route PUT /api/v1/users/id

// @access Private/admin
exports.updateUser = factory.updateOne(User);

// @desc DELETE A USER

// @route DELETE /api/v1/users/:id

// @access Private/admin
exports.deleteUser = factory.deleteOne(User);
