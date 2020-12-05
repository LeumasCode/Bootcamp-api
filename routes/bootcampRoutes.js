const express = require('express');
const { protect, authorize } = require('../controllers/authController');
const {
  getAllBootcamp,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampWithin,
  bootcampPhotoUpload,
} = require('../controllers/bootcampController');

// Include other resource Router
const courseRouter = require('./courseRoutes');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();

//  Re-route into other resource Router
router.use('/:bootcampId/courses', courseRouter);

// Re-route into review resourse
router.use('/:bootcampId/reviews', reviewRouter);

router
  .route('/')
  .get(getAllBootcamp)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);

router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/radius/:zipcode/:distance/:unit').get(getBootcampWithin);

module.exports = router;
