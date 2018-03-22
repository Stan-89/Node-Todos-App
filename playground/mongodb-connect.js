//Object deconstruct what we need
//MongoClient for connecitng, ObjectID for generating ID
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server', err);
  }
  console.log('Connected to MongoDB server');

  const db = client.db('TodoApp');

  //Test insert
  db.collection('Todos').insertOne({
    text: 'This is some text here',
    completed:true
  }, (err, result) => {
    if(err){
      return console.log("Unable to insert todo", err);
    }

    console.log(JSON.stringify(result.ops, undefined,2));
  });


  client.close();
});
