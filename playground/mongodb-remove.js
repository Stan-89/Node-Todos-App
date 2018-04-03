const {ObjectID} = require('mongodb');

const {mongoose} = require('./../server/db/mongoose.js');
const {Todo} = require('./../server/models/todo.js');
const {User} = require('./../server/models/todo.js');


//Removing stuff

//If we want to remove ALL records completely:
/*
Todo.remove({}).then((result) => {
  console.log(result);
});
*/

//Finds a document and removes it, but gives it back to us after deletion
//Todo.findOneAndRemove({_id: 'someIDHere'}).then(...);

//Also: find by id and remove, will also return
//Todo.findByIdAndRemove
Todo.findByIdAndRemove('5ac3d9606ccb963adbf5a26f').then((todo) => {
  console.log(todo);
});
