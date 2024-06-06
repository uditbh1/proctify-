const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: 'String',
    required: [true, 'Please provide a name'],
    maxlength: 30,
  },
  email: {
    type: 'String',
    required: [true, 'Please provide a email'],
    validate: [validator.isEmail, 'Please provide a valid email'],
    unique: true,
    maxlength: 50,
  },
  password: {
    type: 'String',
    required: [true, 'Please provide a password'],
    minlength: 8,
    maxlength: 50,
    select: false,
  },
  confirmPassword: {
    type: 'String',
    required: [true, 'Please confirm your password'],
    validate: {
      // Custom validators only works on save() and create()
      validator: function (val) {
        return val === this.password;
      },
      message: 'Confirm password is different from password',
    },
  },
  role: {
    type: 'String',
    enum: ['teacher', 'student', 'owner'],
    default: 'student',
    required: [true, 'Role must not be empty'],
  }
});

// pre hooks only run when save() and create()
userSchema.pre('save', async function (next) {
  // We are checking if we modified the password when called save() or create() : to prevent hashing our hashed password
  // Bcoz we update other details like email with save(), not findAndUpdate() : So hash only when password is changed or password will be re-hashed
  if (this.isModified('password')) {
    this.confirmPassword = undefined;
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

userSchema.methods.checkPassword = async function (givenPass, userPass) {
  return await bcrypt.compare(givenPass, userPass);
};

const User = mongoose.model('User', userSchema);
module.exports = User;