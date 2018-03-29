//Expect and supertest need to be required. Mocha and nodemon don't need to be required
const expect = require('expect');
//Supertest allows us to do requests for tests
const request = require('supertest');

//Since we need to access the app itself (from server.js), we have to export it there
//So in server.js, we'll put modules.exports = {app};

//Get the app from the server
const {app} = require('./../server.js');
//Also the model itself
const {Todo} = require('./../models/todo.js');

  //Empty the DB before the requests come in
  beforeEach((done) => {
    Todo.remove({}).then(()=>done());
  });


//Recall that we can describe tests (identation)
describe('POST /todos', () => {
  it('should create a new todo by posting it to the endpoint', (done) => {
    //Text variable, since we'll be using it often
    var text = 'Test todo text';

    //We're going to POST to /todos, expecting a 200 and a the text from before
    request(app)
    .post('/todos')
    .send({text})
    .expect((res) => {
      expect(res.body.text).toBe(text);
    })
    //What happens in the end? we can put another test into it.
    .end((err,res) => {
      //If there was an error, finish the test with the error msg. Otherwise continue
      if(err){
        return done(err);
      }

      //Let's check it out: we're going to need to check that 1 Todo was present,
      //And what exactly it was.

      //Find function: like the one we saw for querying
      Todo.find().then((todos) => {
        expect(todos.length).toBe(1);
        expect(todos[0].text).toBe(text);
        done();
      })
      .catch((e) => {
        done(e);
      });
    });
  });

  //Another it: it should not insert if invalid info
  it('should not create a todo with invalid body data', (done) => {
    request(app)
    .post('/todos')
    .send({})
    .expect(400)
    .end((err, res)=>{
      if(err){
        return done(err);
      }

      Todo.find().then((todos) => {
        expect(todos.length).toBe(0);
        done();
      }).catch((e) => done(e));
    });
  });
});
