//We're going to use express and bodyParser
var express = require('express');
var bodyParser = require('body-parser');

//Import mongoose, it will connect us to our db
var {mongoose} = require('./db/mongoose.js');

//Models import
var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');

//To verify our object ID
const {ObjectID} = require('mongodb');

//Get lodash
const _ = require('lodash');

//Our app
var app = express();

//Recall using middleware
//We'll need this since incoming post will be a json
app.use(bodyParser.json());


//------------------------------------------------------------------------------------
//When we POST to todos
app.post('/todos', (req, res) => {

  //Note: no need for "manual" validation, since that's done in the model already
  //by enforcing the required, types, etc. So we can straight up let the post

  //Create todo instance
  var todo = new Todo({
    text: req.body.text
  });

  //After it is created, let's save it
  //Recall that .save method on a Mongoose model entity is async
  todo.save().then((doc) => {
    //Save it in the response so we answer by this
    //Status automatically OK
    res.send(doc);
  }, (e) => {
    //But change the status to 400 since error
    res.status(400).send(e);
  });

});
//------------------------------------------------------------------------------------
//Get the todos
app.get('/todos', (req, res) => {
  //MongooseInstance.find() is a promise, then with the results (we return)
  Todo.find().then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});
//------------------------------------------------------------------------------------
//Fetching a todo from ID passed in URL
/*
    NOTE: INSTEAD OF return.console.log("Invalud"); OR ERROR Console.logging OR
    returning the result object straight up, recall that we're not on the console
    anymore -> with express, we have the ab ility to send statuses, and info
    So: in the get, res is the response, we can res.status(404).send(); //just sending 404
    or we can also send the result
    404 not found so we can send it for any info.
    200 is OK and it gets AUTOMATICALLY sent
*/

app.get('/todos/:id', (req, res) => {
  //Get the id
  const theID = req.params.id;

  //If not valid
  if(!ObjectID.isValid(theID)){
    return res.status(404).send();
  }

  //Now fetch it
  Todo.findById(theID).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }

    //Returning the "real" result
    return res.send({todo});

  }, (e) => {
    return res.status(404).send();
  });



});
//------------------------------------------------------------------------------------
//Delete the todo task
//Note: we're using DELETE Protocol (like GET and POST, but for deleting)
app.delete('/todos/:id', (req, res) => {

  //Get the given id
  var theID = req.params.id;

  //Check if valid format first
  if(!ObjectID.isValid(theID)){
    //Return a 404 without a body since error
    return res.status(404).send();
  }

  //If here, then formatting is OK.
  //findByIdAndRemove, if NULL then it was NOT Removed
  Todo.findByIdAndRemove(theID).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }

    //If here, it was removed and we have it
    //200 automatic status, just send back the body - todo
    res.send({todo});
  }).catch((e) => {
    //If an exception was thrown somewhere, place a catch after the THEN
    //Recall that this way, we take care of the possible exceptions that might occur
    res.status(400).send();
  });

});
//------------------------------------------------------------------------------------
//Updating a specific todo (from its id)
//We're using patch to do it (registering an url to our app through express)
app.patch('/todos/:id', (req, res) => {
  //Get the id from the request
  var id = req.params.id;

  //With lodash's .pick, pick stuff from an existing object to create a new one
  //We'll give the option to the request to have a text field and a completed field
  //For the rest, we'll take care of it ourselves
  var body = _.pick(req.body, ['text', 'completed']);

  //verify if a valid id
  if(!ObjectID.isValid(id)){
    return res.status(404).send();
  }

  //If completed is given (and is a boolean and is true, we take the time now as completed
  //If not, then it is not completed, and no time of completition is given
  if(_.isBoolean(body.completed) && body.completed){
    body.completedAt = new Date().getTime();
  }
  else{
    body.completed = false;
    body.completedAt = null;
  }

  //We are going to use the function findByIdAndUpdate(id, creationOptions)
  //Like findOneAndUpdate for mongo, but we pass through express to do it
  Todo.findByIdAndUpdate(id, {$set:body}, {new: true}).then((todo) => {}).catch((e) => {
    //If any exceptions occur, catch them here, send error msg
    //Recall: $set: body will set THE WHOLE thing to the var body
    //$set : {someProp: 'someVal'} will set the property of that object
    //If our todo is null (!todo), return 404
    if(!todo){
      return res.status(404).send();
    }

    //Send the result now
    res.send({todo});

    //Note: new: true options is similar to returnOriginal: false
    res.status(400).send();
  });

});
//------------------------------------------------------------------------------------

app.listen(3000, () => {
  console.log("Started on port 3000");
});

module.exports = {app};
