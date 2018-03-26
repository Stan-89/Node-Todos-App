//We need mongoose as a static object, not the instance of the db since
//only need the blueprint
var mongoose = require('mongoose');

//Todo model
var Todo = mongoose.model('Todo', {
  text:{
    type: String,
    required:true,
    minlength:1,
    trim:true
  },
  completed:{
    type: Boolean,
    default:false
  },
  completedAt:{
    type: Number,
    default:null
  }
});

//Export it, ES5 style
module.exports = {Todo};
