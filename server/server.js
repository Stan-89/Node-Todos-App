//We run this file when we want to run the app
//First, load Mongoose
var mongoose = require('mongoose');

//Tell mongoose to use its library for promises since we don't want to have to deal with callbacks
mongoose.Promise = global.Promise; //We only have to do this once.

//Connect through mongoose
mongoose.connect('mongodb://localhost:27017/TodoApp');

//Advantage of mongoose: we can declare the connection and then move on to
//other code -> behind the scenes, it will take care of waiting for the connection
//to happen before executing other code. It's good since no need for micromanaging


//Now, we're going to create a model.
/*
  In MongoDB, our collections can store anything (recall collection -> table)
  We can have a document that has age and the others might not have that property.

  Mongoose: more organized. We create a model for everything we want to store.
  A model will have attributes.
*/

//Let's create a Todo model
//First arg: Name of model, second: object of props
/*
  Notes:
  -No need for created at, since the id will contain it like in mongodb usual
  - Many options available for the attributes, such as TYP
*/
var Todo = mongoose.model('Todo', {
  text:{
    type: String
  },
  completed:{
    type: Boolean
  },
  completedAt:{
    type: Number
  }
});

//We have not made any requirements to the models yet
//So we can just insert it like that.

//We create a document by doing var something = new modelName({props: vals})
var newTodo = new Todo({
  text: 'Feed the cats',
  completed: false,
  completedAt: 123123
});

//But we also need to save it
//It has the method since coming from mongoose library
//Save returns a promise, so we can check it out
newTodo.save().then((doc) => {
  console.log("Saved todo", doc);
}, (e) => {
  console.log("Unable to save todo");
});
