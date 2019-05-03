var request = require('request');
var apiOptions = {
    server : "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
    apiOptions.server = "https://pacific-lake-61395.herokuapp.com";
}

var _showError = function (req, res, status) {
    var title, content;
    if (status === 404) {
        title = "404, page not found";
        content = "Oh dear. Looks like we can't find this page. Sorry.";
    } else if (status === 500) {
        title = "500, internal server error";
        content = "How embarrassing. There's a problem with our server.";
    } else {
        title = status + ", something's gone wrong";
        content = "Something, somewhere, has gone just a little bit wrong.";
    }
    res.status(status);
    res.render('generic-text', {
        title : title,
        content : content
    });
};

var renderHomepage = function(req, res, responseBody){
    var message;
    if (!(responseBody instanceof Array)) {
        message = "API lookup error";
        responseBody = [];
    } else {
        if (!responseBody.length) {
            message = "No courses found";
        }
    }
    res.render('courses-list', {
        title: 'Course Tracker',
        pageHeader: {
            title: 'Course Tracker',
            strapline: 'Help keep your school-life in check!'
        },
        courseList: responseBody,
        message: message
    });
};

/* GET 'home' page */
module.exports.homelist = function(req, res) {
    console.log(apiOptions.server);
    var requestOptions, path;
    path = '/api/courses';
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {},
        qs : {}
    };
    request(
        requestOptions,
        function(err, response, body) {
            if (response.statusCode === 200) {
                renderHomepage(req, res, body);
            }
        }
    );
};

var getCourseInfo = function (req, res, callback) {
    var requestOptions, path;
    path = "/api/course/" + req.params.courseid;
    requestOptions = {
        url : apiOptions.server + path,
        method : "GET",
        json : {}
    };
    request(
        requestOptions,
        function(err, response, body) {
            if (response.statusCode === 200) {
                callback(req, res, body);
            } else {
                _showError(req, res, response.statusCode);
            }
        }
    );
};

var renderDetailPage = function (req, res, courseData) {
    res.render('courses-info', {
        title: courseData.name,
        pageHeader: {
            title: courseData.id + ': ' + courseData.name,
            instructor: courseData.instructor
        },
        courseID: courseData._id,
        courseDetails: courseData.courseInfo,
        assignments: courseData.assignments
    });
};

module.exports.coursesInfo = function(req, res) {
    getCourseInfo(req, res, function(req, res, responseData) {
        renderDetailPage(req, res, responseData);
    });
};

var renderSubmittedDetail = function(req, res, courseData) {
    var filteredAssignments = [];
    for (var i = 0; i < courseData.assignments.length; ++i) {
        if (courseData.assignments[i].status !== 'Submitted') {
            filteredAssignments.push(courseData.assignments[i]);
        }
    }
    console.log(filteredAssignments);
    res.render('courses-info', {
        title: courseData.name,
        pageHeader: {
            title: courseData.id + ': ' + courseData.name,
            instructor: courseData.instructor
        },
        courseID: courseData._id,
        courseDetails: courseData.courseInfo,
        assignments: filteredAssignments
    });
};

module.exports.notSubmitted = function(req, res) {
    getCourseInfo(req, res, function(req, res, responseData) {
        renderSubmittedDetail(req, res, responseData);
    });
};

var renderAssignmentForm = function (req, res, courseDetail) {
    res.render('courses-assignment-new', {
        title: 'Add Assignment for ' + courseDetail.name,
        pageHeader: {
            title: 'Add Assignment for ' + courseDetail.name
        },
        options: {
            one: 'Not Started',
            two: 'In Progress',
            three: 'Done',
            four: 'Submitted'
        },
        error: req.query.err
    });
};

module.exports.addAssignment = function(req, res) {
    getCourseInfo(req, res, function(req, res, responseData) {
        renderAssignmentForm(req, res, responseData);
    });
};

module.exports.doAddAssignment = function(req, res){
    var requestOptions, path, courseid, postdata;
    courseid = req.params.courseid;
    path = "/api/courses/" + courseid + '/assignments';
    postdata = {
        name: req.body.name,
        duedate: req.body.duedate,
        points: parseInt(req.body.points),
        status: req.body.status
    };
    requestOptions = {
        url : apiOptions.server + path,
        method : "POST",
        json : postdata
    };
    if (!postdata.name || !postdata.duedate || !postdata.points) {
        res.redirect('/courses/' + courseid + '/assignments/new?err=val');
    } else if (postdata.points < 0 || postdata.points > 100) {
        res.redirect('/courses/' + courseid + '/assignments/new?err=points');
    } else {
            request(
                requestOptions,
            function(err, response, body) {
                console.log(postdata);
                if (response.statusCode === 201) {
                    res.redirect('/course/' + courseid);
                } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError') {
                    res.redirect('/courses/' + courseid + '/assignments/new?err=val');
                } else {
                    console.log(body);
                    _showError(req, res, response.statusCode);
                }
            }
        );
    }
};

module.exports.deleteAssignment = function(req, res) {
    var requestOptions, path, courseid;
    courseid = req.params.courseid;
    assignmentid = req.params.assignmentsid;
    path = "/api/courses/" + courseid + "/assignments/" + assignmentid;
    requestOptions = {
        url : apiOptions.server + path,
        method : "DELETE",
        json : {}
    };
    request(
        requestOptions,
        function(err, response, body) {
            console.log(response.statusCode);
            if (response.statusCode === 204) {
                res.redirect('/course/' + courseid);
            } else {
                console.log(body);
                _showError(req, res, response.statusCode);
            }
        }
    );
};

var renderEditForm = function (req, res, courseAssign, courseData) {
    res.render('courses-assignment-edit', {
        title: 'Edit Assignment for ' + courseData.name,
        pageHeader: {
            title: 'Edit Assignment for ' + courseData.name,
            assign: courseAssign
        },
        options: [
            {name: 'Not Started'},
            {name: 'In Progress'},
            {name: 'Done'},
            {name: 'Submitted'}
        ],
        error: req.query.err
    });
};

module.exports.editAssignment = function(req, res) {
    getCourseInfo(req, res, function(req, res, courseData) {
        var requestOptions, path;
        path = "/api/courses/" + req.params.courseid + "/assignments/" + req.params.assignmentsid;
        requestOptions = {
            url : apiOptions.server + path,
            method : "GET",
            json : {}
        };
        request(
            requestOptions,
            function(err, response, body) {
                if (response.statusCode === 200) {
                    renderEditForm(req, res, body, courseData);
                } else {
                    _showError(req, res, response.statusCode);
                }
            }
        );
    });
};

module.exports.doEditAssignment = function(req, res){
    var requestOptions, path, courseid, postdata;
    courseid = req.params.courseid;
    assignmentid = req.params.assignmentsid;
    path = "/api/courses/" + courseid + '/assignments/' + assignmentid;
    postdata = {
        name: req.body.name,
        duedate: req.body.duedate,
        points: parseInt(req.body.points),
        status: req.body.status
    };
    requestOptions = {
        url : apiOptions.server + path,
        method : "PUT",
        json : postdata
    };
    if (!postdata.name || !postdata.duedate || !postdata.points) {
        res.redirect('/courses/' + courseid + '/assignments/' + assignmentid + '/edit?err=val');
    } else if (postdata.points < 0 || postdata.points > 100) {
        res.redirect('/courses/' + courseid + '/assignments/' + assignmentid + '/edit?err=points');
    } else {
        request(
            requestOptions,
            function(err, response, body) {
                console.log(postdata);
                if (response.statusCode === 200) {
                    res.redirect('/course/' + courseid);
                } else if (response.statusCode === 400 && body.name && body.name === 'ValidationError') {
                    res.redirect('/courses/' + courseid + '/assignments/' + + assignmentid + '/edit?err=val');
                } else {
                    console.log(body);
                    _showError(req, res, response.statusCode);
                }
            }
        );
    }
};