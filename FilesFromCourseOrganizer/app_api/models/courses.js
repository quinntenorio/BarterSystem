var mongoose = require( 'mongoose' );

var assignmentsSchema = new mongoose.Schema({
    name: {type: String, required: true},
    duedate: {type: String, required: true},
    points: {type: Number, "default": 0, min: 0, max: 100},
    status: {type : String, required: true}
});

var courseInfoSchema = new mongoose.Schema({
    credits: Number,
    where: String,
    when: String
});

var coursesSchema = new mongoose.Schema({
    id: {type: String, required: true},
    name: {type: String, required: true},
    instructor: String,
    courseInfo: [courseInfoSchema],
    assignments: [assignmentsSchema]
});

mongoose.model('Courses', coursesSchema);