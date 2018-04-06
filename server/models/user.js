//Mongoose since it will be our framework for the object.
const mongoose = require('mongoose');
//Validator: we want to check if it is an email
const validator = require('validator');

//Our model
var User = mongoose.model('User', {
  email: {
    type: String,
    required: true,
    //Will trim white space around it
    trim: true,
    minlength: 1, //Only one may be contained in the DB at a time
    unique: true,
    //CUSTOM Requirement (we could have used any name)
    //CUSTOM VALIDATORS (on Moongoosejs.com): validate takes two props,
    //a validator that returns true or false,
    //and a message with {VALUE} in case it fails
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  /* Tokens is an array. Feature available in MongoDB
     In this nested document, we access how we give access to users
  */
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
});
module.exports = {User}
