
const {MongoClient, ObjectID} = require('mongodb');


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
  if (err) {
    return console.log('Unable to connect to MongoDB server', err);
  }
  console.log('Connected to MongoDB server');

  const db = client.db('TodoApp');

  //Test fetch
  db.collection('Todos').find({completed:true}).toArray()
  .then((docs) => {
    console.log("Todos");
    console.log(JSON.stringify(docs, undefined, 2));
  },
    (err) => {
      console.log("Unable to fetch todos", err);
    });


  client.close();
});
