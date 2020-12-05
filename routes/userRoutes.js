const express = require('express');
const {
  register,
  login,
  protect,
  getMe,
  forgotPassword,
  resetPassword,
  updatePassword,
  updateMe,
  authorize,
  logout,
} = require('../controllers/authController');

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/userController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/logout', protect, logout);

router.get('/me', protect, getMe);

router.put('/updateMe', protect, updateMe);

router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resetToken', resetPassword);
router.put('/updatePassword', protect, updatePassword);

// ADMIN ROUTES
router.use(protect);
router.use(authorize('admin'));

router.route('/').get(getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
