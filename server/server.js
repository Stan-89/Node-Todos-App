//Import mongoose, which is already connected to the database.
//Recal ES6 destructuring (instead of theObject.mongoose, straight up {mongoose}
//so we declare it as a variable as well.
var {mongoose} = require('./db/mongoose.js');

//Models importation
var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');


//Todo entity
var newTodo = new Todo({
  text: 'Feed the cats',
  completed: false,
  completedAt: 123123
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
  mongoose.connection.close();
}, (e) => {
  console.log("Unable to save todo");
});

//Note:we put the close here, we get an error since insert hasn't finished yet
