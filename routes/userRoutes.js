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
} = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', protect, getMe);

router.put('/updateMe', protect, updateMe);

router.post('/forgotPassword', forgotPassword);
router.put('/resetPassword/:resetToken', resetPassword);
router.put('/updatePassword', protect, updatePassword);

module.exports = router;
