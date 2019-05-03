var mongoose = require('mongoose');
var Cour = mongoose.model('Courses');

var sendJSONresponse = function(res, status, content) {
    res.status(status);
    res.json(content);
};

module.exports.coursesReadSpecific = function(req, res) {
    console.log('Finding course details', req.params);
    if (req.params && req.params.courseid) {
        Cour
            .findById(req.params.courseid)
            .exec(function(err, course) {
                if (!course) {
                    sendJSONresponse(res, 404, {
                        "message": "courseid not found"
                    });
                    return;
                } else if (err) {
                    console.log(err);
                    sendJSONresponse(res, 404, err);
                    return;
                }
                console.log(course);
                sendJSONresponse(res, 200, course);
            });
    } else {
        console.log('No courseid specified');
        sendJSONresponse(res, 404, {
            "message": "No courseid in request"
        });
    }
};

module.exports.coursesReadList = function(req, res) {
    Cour
        .find({})
        .select('-courseInfo -assignments')
        .exec(function(err, courses) {
            if (!courses) {
                sendJSONresponse(res, 404, {
                    "message": "there are no courses!"
                });
                return;
            } else if (err) {
                console.log(err);
                sendJSONresponse(res, 404, err);
                return;
            }
            console.log(courses);
            sendJSONresponse(res, 200, courses);
        });
};