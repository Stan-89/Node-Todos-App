//We run this file when we want to run the app
//First, load Mongoose
var mongoose = require('mongoose');

//Tell mongoose to use its library for promises since we don't want to have to deal with callbacks
mongoose.Promise = global.Promise; //We only have to do this once.

//Connect through mongoose
mongoose.connect('mongodb://localhost:27017/TodoApp');

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

//Todo entity
var newTodo = new Todo({
  text: 'Feed the cats',
  completed: false,
  completedAt: 123123
});

//Make a model for the user
//Recall: first arg is the name of the model, second is the "blueprint" for the types and their types/options
//Where they are an object of objects, propertyName: { required: ...., default: ...}
var User = mongoose.model('User', {
  email:{
    type:String,
    required:true,
    trim:true,
    minlength:1
  }
});


//Insert a user entity
var user = new User({
  email: 'test@somewhere.ca'
});

user.save().then((doc) => {
  console.log("Saved the user");
}, (e) => {
  console.log("Unable to save the todo", e);
});


//Save the stuff
newTodo.save().then((doc) => {
  console.log("Saved todo", doc);
}, (e) => {
  console.log("Unable to save todo");
});
