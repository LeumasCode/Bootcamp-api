const express = require('express');
const {
  getReviews,
  getReview,
  createReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('user', 'admin'), createReview);

router.route('/:id').get(getReview);

module.exports = router;
