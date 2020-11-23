const express = require('express');
const {
  getCourses,
  getACourse,
  createCourse,
} = require('../controllers/courseController');

const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses).post(createCourse);

router.route('/:id').get(getACourse);

module.exports = router;
