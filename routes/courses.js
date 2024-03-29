const express = require('express');
const 
{
  getCourses,
  getCourse,
  addCourse,
  updateCourse,
  deleteCourse

} = require('../controllers/courses');

const Course = require('../models/Course');

const router = express.Router({mergeParams: true});

const {protect} =require('../middleware/auth')

router.route('/')
  .get(getCourses)
  .post( addCourse)

router.route('/:id')
    .get(getCourse)
    .put( updateCourse)
    .delete( deleteCourse)

module.exports = router;