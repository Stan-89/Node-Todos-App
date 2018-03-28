//We're going to use express and bodyParser
var express = require('express');
var bodyParser = require('body-parser');

//Import mongoose, it will connect us to our db
var {mongoose} = require('./db/mongoose.js');

//Models import
var {Todo} = require('./models/todo.js');
var {User} = require('./models/user.js');

//Our app
var app = express();

//Recall using middleware
//We'll need this since incoming post will be a json
app.use(bodyParser.json());

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

app.listen(3000, () => {
  console.log("Started on port 3000");
});
