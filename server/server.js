//Setup our environment
require('./config/config.js');

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

//Get our authenticate through object deconstruction
var {authenticate} = require('./middleware/authenticate.js');

//Our app
var app = express();

//Recall using middleware
//We'll need this since incoming post will be a json
app.use(bodyParser.json());


//------------------------------------------------------------------------------------
//When we POST to todos
app.post('/todos', authenticate, (req, res) => {

  //Note: no need for "manual" validation, since that's done in the model already
  //by enforcing the required, types, etc. So we can straight up let the post

  //Create todo instance
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id,
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
app.get('/todos', authenticate, (req, res) => {
  //MongooseInstance.find() is a promise, then with the results (we return)
  Todo.find({
    _creator:req.user._id
  }).then((todos) => {
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

app.get('/todos/:id', authenticate, (req, res) => {
  //Get the id
  const theID = req.params.id;

  //If not valid
  if(!ObjectID.isValid(theID)){
    return res.status(404).send();
  }

  //Now fetch it
  //But we have to match two ids -> theID which is the todo ID, and the user id
  //Recall: findOne
  Todo.findOne({
    _id: theID,
    _creator: req.user._id
  }).then((todo) => {
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
app.delete('/todos/:id', authenticate, (req, res) => {

  //Get the given id
  var theID = req.params.id;

  //Check if valid format first
  if(!ObjectID.isValid(theID)){
    //Return a 404 without a body since error
    return res.status(404).send();
  }

  //If here, then formatting is OK.
  //findByIdAndRemove, if NULL then it was NOT Removed
  //findOneAndRemove since two arguments to search for
  Todo.findOneAndRemove({
      _id: theID,
      _creator: req.user._id
    }).then((todo) => {
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
app.patch('/todos/:id', authenticate,  (req, res) => {
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
  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set:body}, {new: true}).then((todo) => {
    //If any exceptions occur, catch them here, send error msg
    //Recall: $set: body will set THE WHOLE thing to the var body
    //$set : {someProp: 'someVal'} will set the property of that object
    //If our todo is null (!todo), return 404
    if(!todo){
      return res.status(404).send();
    }
    //Send the result now
    res.send({todo});
  }).catch((e) => {
    //Note: new: true options is similar to returnOriginal: false
    res.status(400).send();
  });

});
//------------------------------------------------------------------------------------
//---------------------------------------USERS PART START ---------------------------------------------
  //Post to create users -> with our model
  app.post('/users', (req, res) => {
    //Body is the object that we're going to be inserting
    //We'll use _.pick to straight up pick the email and password from a request and make them into an obj
    var body = _.pick(req.body, ['email', 'password']);
    //Note on the user creation: to create an object BY USING A MODEL, pass the data as args
    //whereas the model is mongoose.model('User', {...}); and our var body contains the needed stuff
    //that is named in the same way as welL: email, password
    var user = new User(body);

    //Note: validation would stop ^ there, if there were any errors. So no need to do anything here
    user.save().then((user) => {
      return user.generateAuthToken();
    }).then((token) => {
      //Setting an x-something header is standard for CUSTOM created headers
      res.header('x-auth', token).send(user);
    }).catch((e) => {
      res.status(400).send(e);
    });
  });

  //Get a specific user detail
  //Pass the middleware wwe wrote authenticate
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

//Login part
app.post('/users/login', (req, res) => {
  //Pick up email and password fields - if not there, it will be null - we'll get a 400 code anyways
  //So no need for validation if there or not -> amounts to the same thing in the end.

  //Recall that the result of _.pick is an object with the props from the obj we picked
  var body = _.pick(req.body, ['email', 'password']);

  //Use our defined function -> recall that it's a promise -> so .then on it
  //We give back user in that promise (the mathed document from our collection)
  User.findByCredentials(body.email, body.password).then((user) => {
    //We're here, means the login was right, user was found
    //So we need to generate a token like we do on registration and send it back
    //generateAuthToken - we defined it as a promise as well since salting
    return user.generateAuthToken().then((token) => {
      //We made geenrateAuthToken to return the token
      //We set the x-auth header, and set it to the value
      //Plus, we send the user obj as well (its toJSON method was overriden)
      //So no leaks of sensitive information
      res.header('x-auth', token).send(user);
    });

  }).catch((e) => {
    //Send a 400 code in the case of an error
    res.status(400).send();
  });
});

//Logging out - we're going to DELETE the token.
//So app.delete
//Recall that we previously created middleware that we can use in requests
//Where we make sure that the user is logged in(has appropriate & valid token)
app.delete('/users/me/token', authenticate, (req, res) => {
  //The request body has a 'short' version of the user object (id and pass)
  //Mongoose will "recognize" it and not throw an error
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  },() => {
    res.status(400).send();
  });
});


//---------------------------------------USERS PART END ---------------------------------------------



app.listen(3000, () => {
  console.log("Started on port 3000");
});

module.exports = {app};
