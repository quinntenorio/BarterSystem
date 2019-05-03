var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

var tradeSchema = new mongoose.Schema({
    name: String
});

var itemsSchema = new mongoose.Schema({
    name: String,
    condition: String,
    istrading: Boolean,
    tradingfor: String,
    trader: String,
    tradeItems: [tradeSchema]
});

var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  username: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  passwordConf: {
    type: String,
    required: true
  },
  items: [itemsSchema]
});

//authenticate input against database
UserSchema.statics.authenticate = function (email, password, callback) {
    User.findOne({ email: email })
        .exec(function (err, user) {
            console.log(user);
            if (err) {
                return callback(err)
            } else if (!user) {
                var err = new Error('User not found.');
                err.status = 401;
                return callback(err);
            }
            if (password === user.passwordConf) {
                console.log("true");
                return callback(null, user);
            }
            bcrypt.compare(password, user.password, function (err, result) {
                if (result === true) {
                    console.log("true");
                    return callback(null, user);
                } else {
                    console.log("false");
                    return callback();
                }
            })
        });
};


//hashing a password before saving it to the database
UserSchema.pre('save', function (next) {
    var user = this;
    bcrypt.hash(user.password, 10, function (err, hash) {
        if (err) {
            return next(err);
        }
        user.password = hash;
        next();
    })
});


var User = mongoose.model('User', UserSchema);
module.exports = User;
