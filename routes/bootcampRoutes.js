const express = require('express');
const {
  getAllBootcamp,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampWithin,
} = require('../controllers/bootcampController');

// Include other resource Router
const courseRouter = require('./courseRoutes');

const router = express.Router();

//  Re-route into other resource Router
router.use('/:bootcampId/courses', courseRouter);

router.route('/').get(getAllBootcamp).post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance/:unit').get(getBootcampWithin);

module.exports = router;
