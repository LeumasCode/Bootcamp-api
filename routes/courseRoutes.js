const express = require('express');
const {
  getCourses,
  getACourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require('../controllers/courseController');

const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses).post(createCourse);

router.route('/:id').get(getACourse).put(updateCourse).delete(deleteCourse);

module.exports = router;
