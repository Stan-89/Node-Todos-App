//Object deconstruct what we need
//MongoClient for connecitng, ObjectID for generating ID
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server', err);
  }
  console.log('Connected to MongoDB server');

  const db = client.db('TodoApp');

  //Run some inserts
  db.collection('Todos').insertOne({
    text: 'This is some text here',
    author: 'Stannis',
    completed:true});

  db.collection('Todos').insertOne({
    text: 'This is some text here',
    author: 'Stannis',
    completed:true});

  db.collection('Todos').insertOne({
    text: 'This is some text here',
    author: 'Stannis - 2',
    completed:true});

  db.collection('Todos').insertOne({
    text: 'This is some text here',
    author: 'Stannis - 3',
    completed:true});

  //deleteMany - deletes many
  //Ex: delete all todos by author Stannis
  db.collection('Todos').deleteMany({author: 'Stannis'})
  .then((result) => {console.log("Deleted all todos by author Stannis")});

  //deleteOne - deletes only one
  db.collection('Todos').deleteOne({author: 'Stannis - 2'})
  .then((result) => {console.log("Deleted 1 todo by author Stannis - 2")});

  //findOneAndDelete - deletes one AND RETURNS it
  db.collection('Todos').findOneAndDelete({author: 'Stannis - 3'})
  .then((result) => {console.log("Found one and deleted (and returned it) by author Stannis - 3")});

  client.close();
});
