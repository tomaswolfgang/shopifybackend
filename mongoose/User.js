const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {type: String, required: true, maxlength: 30, minlength: 4, unique: true, trim: true},
    password: {type: String, required: true}
}, { timestamps: {} }
);

UserSchema.pre('save', function (next) {
  var user = this;
  bcrypt.hash(user.password, 10, function (err, hash){
    if (err) {
      return next(err);
    }
    user.password = hash;
    //console.log("saving password as ", hash);;
    return next();
  })
});

//authenticate input against database
UserSchema.statics.auth = function (username, password, callback) {
  this.findOne({ username })
    .exec(function (err, user) {
      if (err) {
        return callback(err)
      } else if (!user) {
        var err = 'User not found';
        return callback(err);
      }
      // console.log("real user", user);
      // console.log("request", password);
      bcrypt.compare(password, user.password, function (err, result) {
        if (result === true) {
          return callback(null,user._id);
        } else {
          var err = 'Password is incorrect';
          return callback(err);
        }
      })
    });
}

module.exports = mongoose.model('User', UserSchema);
