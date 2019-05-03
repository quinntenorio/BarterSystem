var express = require('express');
var router = express.Router();
var ctrlCourses = require('../controllers/courses');

/* Locations pages */
router.get('/', ctrlCourses.homelist);
router.get('/course/:courseid', ctrlCourses.coursesInfo);
router.get('/course/:courseid/notSubmitted', ctrlCourses.notSubmitted);
router.get('/courses/:courseid/assignments/new', ctrlCourses.addAssignment);
router.post('/courses/:courseid/assignments/new', ctrlCourses.doAddAssignment);
router.get('/courses/:courseid/assignments/:assignmentsid/edit', ctrlCourses.editAssignment);
router.post('/courses/:courseid/assignments/:assignmentsid/edit', ctrlCourses.doEditAssignment);
router.get('/courses/:courseid/assignments/:assignmentsid/delete', ctrlCourses.deleteAssignment);

module.exports = router;