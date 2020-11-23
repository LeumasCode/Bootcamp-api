const express = require('express');
const {
  getAllBootcamp,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampWithin,
} = require('../controllers/bootcampController');

const router = express.Router();

router.route('/').get(getAllBootcamp).post(createBootcamp);

router
  .route('/:id')
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route('/radius/:zipcode/:distance/:unit').get(getBootcampWithin);

module.exports = router;
