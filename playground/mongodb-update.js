//Object deconstruct what we need
//MongoClient for connecitng, ObjectID for generating ID
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server', err);
  }
  console.log('Connected to MongoDB server');

  const db = client.db('TodoApp');

  //Complete an insert that we're going to modify after
  //To see it step-by-step, comment things out
  db.collection('Users').insertOne({
    name: "Stan",
    age: 26
  }).then((res) => {console.log(res)});

  db.collection('Users').findOneAndUpdate(
    {name: "Stan"},
    {
      $set:{
        name:"Stannis"
      },
      $inc:{
        age:2
      }
    },
    {returnOriginal: false}
  ).then((res) => {console.log(res)});


  client.close();
});
