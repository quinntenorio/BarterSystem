var express = require('express');
var router = express.Router();
var ctrlCourses = require('../controllers/courses');
var ctrlAssignments = require('../controllers/assignments');

// Regarding Courses
router.get('/courses', ctrlCourses.coursesReadList);
router.get('/course/:courseid', ctrlCourses.coursesReadSpecific);
// Regarding Assignments
router.post('/courses/:courseid/assignments', ctrlAssignments.assignmentsCreate);
router.get('/courses/:courseid/assignments', ctrlAssignments.assignmentsGetAll);
router.get('/courses/:courseid/assignments/:assignmentsid', ctrlAssignments.getAssignment);
router.put('/courses/:courseid/assignments/:assignmentsid', ctrlAssignments.assignmentsUpdateOne);
router.delete('/courses/:courseid/assignments/:assignmentsid', ctrlAssignments.assignmentsDeleteOne);

module.exports = router;