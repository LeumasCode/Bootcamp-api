const express = require('express');
const {
  getReviews,
  getReview,
  createReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect, authorize } = require('../controllers/authController');

const router = express.Router({ mergeParams: true });

router
  .route('/')
  .get(getReviews)
  .post(protect, authorize('user', 'admin'), createReview);

router
  .route('/:id')
  .get(getReview)
  .put(protect, authorize('user', 'admin'), updateReview)
  .delete(protect, authorize('user', 'admin'), deleteReview);

module.exports = router;
