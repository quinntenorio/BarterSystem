var mongoose = require('mongoose');
var Cour = mongoose.model('Courses');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.assignmentsCreate = function(req, res) {
    if (req.params.courseid) {
        Cour
            .findById(req.params.courseid)
            .select('assignments')
            .exec(
                function(err, course) {
                    if (err) {
                        sendJSONresponse(res, 400, err);
                    } else {
                        doAddAssignment(req, res, course);
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, courseid required"
        });
    }
};


var doAddAssignment = function(req, res, course) {
    if (!course) {
        sendJSONresponse(res, 404, "courseid not found");
    } else {
        course.assignments.push({
            name: req.body.name,
            duedate: req.body.duedate,
            points: req.body.points,
            status: req.body.status
        });
        course.save(function(err, course) {
            var thisAssignment;
            //if (err) {
            //    console.log(err);
            //    sendJSONresponse(res, 400, err);
            //} else {
                thisAssignment = course.assignments[course.assignments.length - 1];
                sendJSONresponse(res, 201, thisAssignment);
            //}
        });
    }
};

module.exports.assignmentsUpdateOne = function(req, res) {
    if (!req.params.courseid || !req.params.assignmentsid) {
        sendJSONresponse(res, 404, {
            "message": "Not found, courseid and assignmentsid are both required"
        });
        return;
    }
    Cour
        .findById(req.params.courseid)
        .select('assignments')
        .exec(
            function(err, course) {
                var thisAssignment;
                if (!course) {
                    sendJSONresponse(res, 404, {
                        "message": "courseid not found"
                    });
                    return;
                } else if (err) {
                    sendJSONresponse(res, 400, err);
                    return;
                }
                if (course.assignments && course.assignments.length > 0) {
                    thisAssignment = course.assignments.id(req.params.assignmentsid);
                    if (!thisAssignment) {
                        sendJSONresponse(res, 404, {
                            "message": "assignmentsid not found"
                        });
                    } else {
                        thisAssignment.name = req.body.name;
                        thisAssignment.duedate = req.body.duedate;
                        thisAssignment.points = req.body.points;
                        thisAssignment.status = req.body.status;
                        course.save(function(err) {
                            if (err) {
                                sendJSONresponse(res, 404, err);
                            } else {
                                sendJSONresponse(res, 200, thisAssignment);
                            }
                        });
                    }
                } else {
                    sendJSONresponse(res, 404, {
                        "message": "No assignment to update"
                    });
                }
            }
        );
};

module.exports.assignmentsGetAll = function(req, res) {
    console.log("Getting all assignment");
    if (req.params && req.params.courseid) {
        Cour
            .findById(req.params.courseid)
            .select('assignments')
            .exec(
                function(err, course) {
                    console.log(course);
                    if (!course) {
                        sendJSONresponse(res, 404, {
                            "message": "courseid not found"
                        });
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                    if (course.assignments && course.assignments.length > 0) {
                        sendJSONresponse(res, 200, course.assignments);
                    } else {
                        sendJSONresponse(res, 404, {
                            "message": "No assignments found"
                        });
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, courseid required"
        });
    }
};

module.exports.getAssignment = function(req, res) {
    console.log("Getting one assignment");
    if (req.params && req.params.courseid && req.params.assignmentsid) {
        Cour
            .findById(req.params.courseid)
            .select('assignments')
            .exec(
                function(err, course) {
                    console.log(course);
                    if (!course) {
                        sendJSONresponse(res, 404, {
                            "message": "courseid not found"
                        });
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                    if (course.assignments && course.assignments.length > 0) {
                        if (!course.assignments.id(req.params.assignmentsid)) {
                            sendJSONresponse(res, 404, {
                                "message": "assignmentsid not found"
                            });
                        } else {
                            var assign = course.assignments.id(req.params.assignmentsid);
                            course.save(function (err) {
                                if (err) {
                                    sendJSONresponse(res, 404, err);
                                } else {
                                    sendJSONresponse(res, 200, assign);
                                }
                            });
                        }
                    } else {
                        sendJSONresponse(res, 404, {
                            "message": "No assignment found"
                        });
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, courseid required"
        });
    }
};

module.exports.assignmentsDeleteOne = function(req, res) {
    if (req.params && req.params.courseid && req.params.assignmentsid) {
        Cour
            .findById(req.params.courseid)
            .select('assignments')
            .exec(
                function (err, course) {
                    if (!course) {
                        sendJSONresponse(res, 404, {
                            "message": "courseid not found"
                        });
                        return;
                    } else if (err) {
                        sendJSONresponse(res, 400, err);
                        return;
                    }
                    if (course.assignments && course.assignments.length > 0) {
                        if (!course.assignments.id(req.params.assignmentsid)) {
                            sendJSONresponse(res, 404, {
                                "message": "assignmentsid not found"
                            });
                        } else {
                            course.assignments.id(req.params.assignmentsid).remove();
                            course.save(function (err) {
                                if (err) {
                                    sendJSONresponse(res, 404, err);
                                } else {
                                    sendJSONresponse(res, 204, null);
                                }
                            });
                        }
                    } else {
                        sendJSONresponse(res, 404, {
                            "message": "No assignment to delete"
                        });
                    }
                }
            );
    } else {
        sendJSONresponse(res, 404, {
            "message": "Not found, courseid and assignmentsid are both required"
        });
    }
};