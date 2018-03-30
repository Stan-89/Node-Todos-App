//Import mongoose since we need the connection
//By declaring the var, we're connecting since that's done in mongoose.js file
//And we export it here, so we execute it as well.
const {mongoose} = require('./../server/db/mongoose.js');

//We also need our model
const {Todo} = require('./../server/models/todo.js');

//ObjectID so we can test the validity
const {ObjectID} = require('mongodb');

var id = '5abe751d4039295b1b406df9';

//We check the VALIDITY of the ID (its form). Doesn't mean it's in the db, only that
//the values are VALID according to the algorithm.
if(!ObjectID.isValid(id)){
  return console.log("ID not valid!");
}


//Find all results that match the id if {_id:id} and find() for all
Todo.find().then((todos) => {
  console.log('All Todos', todos);
});


//Find that particular one with the id
Todo.findOne({
  _id: id
}).then((todo) => {
  console.log('The one and only', todo)
});

//Find by id
//To be 100% sure, we test the id: if not found, it will be null
//Recall that returning a console.log is possible
Todo.findById(id).then((todo) => {
  //If not found,
  if(!todo){
    return console.log("Id not found");
  }
  console.log("The one", todo);
});
