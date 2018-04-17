//Importing the necessary information
const {ObjectID} = require('mongodb');
const {Todo} = require('./../../models/todo.js');
const {User} = require('./../../models/user');
const jwt = require('jsonwebtoken');



//---------------------------------------- USER TESTING HERE
//Taking care of the user testing now

//we need to know the ids in advance since we're using it to sign the auth token
//(recall that it is composed of _id and access:auth)
const userOneId = new ObjectID();
const userTwoId = new ObjectID();

//First we seed the todos from before
//Create a constant of todos (two of them)
const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed:true,
  completedAt: 333,
  _creator: userTwoId
}];

//Function that will populate it
const populateTodos = (done) => {
  Todo.remove({}).then(()=>{
    //Recall that to chain thens, we must return a promise in the n-1 then
    return Todo.insertMany(todos); //MongooseInstance.insertMany(object)
  }).then(() => done());
};

//Finally, export the info we need
//We need the function populateTodos but also todos since they are used in the function

//the users array
//Each object has: _id that we generated, email since required, and pass
//ONly first object has an auth token: json web token sign with id and auth
const users = [{
  _id: userOneId,
  email: 'stan@example.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}, {
  _id: userTwoId,
  email: 'stannis@example.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
  }]
}];

//Populate users works in exactly the same way as populate todos
//Take done as an argument, call it when done
const populateUsers = (done) => {
  //Remvoe all users
  //Recall that MODEL OPERATIONS (REMOVE, SAVE) ARE ASYNCHRONOUS!
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    //We have two promises that we're waiting for to succeed.
    //Promise.all takes an array of promises, waits for them to complete
    //Promise.all([userOne, userTwo]).then(...)
    //ITSELF IS A PROMISE AS WELL. but since we want to CHAIN THEM.
    //Recall that to chain todos: we must RETURN A PROMISE IN THE THEN AND THEN
    //Chain another then
    return Promise.all([userOne, userTwo]);
  }).then(() => done());
};


module.exports = {todos, populateTodos, users, populateUsers};
