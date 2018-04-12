//Expect and supertest need to be required. Mocha and nodemon don't need to be required
const expect = require('expect');
//Supertest allows us to do requests for tests
const request = require('supertest');

//Since we'll be using it
const {ObjectID} = require('mongodb');

//Since we need to access the app itself (from server.js), we have to export it there
//So in server.js, we'll put modules.exports = {app};

//Get the app from the server
const {app} = require('./../server.js');
//Also the model itself
const {Todo} = require('./../models/todo.js');

//We're going to need the user as well
const {User} = require('./../models/user.js');

//And from our seed
const {todos, populateTodos, users, populateUsers} = require('./seed/seed.js');




//Empty the DB before the requests come in
//Before each: execute that particular function in the callback passed as arg into beforeEach
beforeEach(populateUsers);
beforeEach(populateTodos);
//------------------------------------------------------------------------------------
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
      Todo.find({text}).then((todos) => {
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
        expect(todos.length).toBe(2);
        done();
      }).catch((e) => done(e));
    });
  });
});
//------------------------------------------------------------------------------------
//------------------------------------------------------------------------------------
//Recall that we can describe tests (identation)
describe('GET /todos', () => {
  it('It should GET All TODOS', (done) => {
    request(app)
    .get('/todos')
    .expect(200)
    .expect((res) => {
      expect(res.body.todos.length).toBe(2);
    })
    .end(done);//When end with nothing in it but done, we can just pass done as a var arg.
  });
});
//------------------------------------------------------------------------------------
//Getting a particular todo
describe('GET /todos/:id', () =>{
  //Finding an existing todo
  it('Should return a todo doc', (done) => {
    request(app) //Note that we're using `` for $vars in text, ES6, it is ${varNameWithJS}
    //Also note: we created ids (for the purpose of testing) before
    //the insertion {_id: new ObjectID(),text: 'First test todo'}
    //.toHexString(): recall that _id is in fact an ObjectID and it has a method
    //called objectId.toHexString() which will
    //'Return the ObjectID id as a 24 byte hex string representation'
    .get(`/todos/${todos[0]._id.toHexString()}`)
    .expect(200)
    .expect((res) => {
      expect(res.body.todo.text).toBe(todos[0].text);
    })
    .end(done);//Done is a param argument here
  });

  it('Should return 404 if todo not found', (done) => {
    var hexId = new ObjectID().toHexString();
    console.log('See what it looks like', hexId);
    request(app)
    .get(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });

  it('Should return 404 for non-object id as well', (done) => {
    request(app)
    .get('/todos/123abc')
    .expect(404)
    .end(done);
  });
});
//------------------------------------------------------------------------------------
//Deleting a particular todo
describe('DELETE /todos/:id', () => {

  //Should remove a particular todo
  it('Should remove a todo', (done) => {
    //We chose an existing ID from the ones we insert in the beginning!
    //Recall:we give them ids in the beginning
    var hexId = todos[1]._id.toHexString();

    //Make a delete request with that HEX Id.
    //Expect the deleted id to be the one given (from result object)
    //Since this is how we declared our function previously.
     request(app)
     .delete(`/todos/${hexId}`)
     .expect(200)
     .expect((res) => {
       expect(res.body.todo._id).toBe(hexId);
     })//In the end, if error, return done with the error
     .end((err, res) => {
       if (err) {
         return done(err);
       }
       //Find by this id, expect expect(returendResult) toBeNull since not there
       //!Note: testing for null => expect(thething).toNotExist();
       Todo.findById(hexId).then((todo) => {
         expect(todo).toBeNull();
         done(); //Done after testing it
       }).catch((e) => done(e));//Catch if error
     });
   });

   //Get a random ID, put it to hexString and check for it
  it('should return 404 if todo not found', (done) => {
  var hexId = new ObjectID().toHexString();
  request(app)
    .delete(`/todos/${hexId}`)
    .expect(404)
    .end(done);
  });

  //Invalid request
  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/todos/123abc')
      .expect(404)
      .end(done);
  });
});
//------------------------------------------------------------------------------------
  //Testing the patching (updating)
  describe('PATCH /todos/:id', () => {

    //Should update the todo we inserted
    it('Should update the todo', (done) => {
      //Get the id from the inserted todos (on beforeEach)
      //Generate hex string of the id
      var hexId = todos[0]._id.toHexString();

      //The new text we're going to insert
      var text = 'This will be the new text';

      //Use the app
      request(app) //Sending a PATCH request
      .patch(`/todos/${hexId}`)
      .send({
        completed: true,
        text
      }) //Sending the info for updating the particular object
      .expect(200)
      .expect((res) =>
      {
        expect(res.body.todo.text).toBe(text); //We expect it to be the same text we gave
        expect(res.body.todo.completed).toBe(true); //Must be true in any event
        expect(typeof res.body.todo.completedAt).toBe('number'); //Must be a number, since timestamp
      })
      .end(done);
    });

    //Same test, but not completed and completedAt will be null/won't exist
    it('Should update the todo, but this time not completed on 2nd unit', (done) => {
      var hexId = todos[1]._id.toHexString();

      var text = 'This will be the new text second type';

      request(app) //Sending a PATCH request
      .patch(`/todos/${hexId}`)
      .send({
        completed: false,
        text
      }) //Sending the info for updating the particular object
      .expect(200)
      .expect((res) =>
      {
        expect(res.body.todo.text).toBe(text); //We expect it to be the same text we gave
        expect(res.body.todo.completed).toBe(false); //Must be true in any event
        expect(res.body.todo.completedAt).toBeNull(); //Must be a number, since timestamp
      })
      .end(done);
    });


  });

//------------------------------------------------------------- Testing for the users

//-------Account creation testing

//Describing tests for /users, on POST
describe('POST /users', () => {

  //We should fully create a user here
  it('should create a user', (done) => {
    //Email and pass that we're going to send
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        //In this test, expect 200 (OK) AND
        //To get x-auth header (token) back
        //And body to has _id existing and email that is an email value
        expect(res.headers['x-auth']).toBeTruthy();
        expect(res.body._id).toBeTruthy();
        expect(res.body.email).toBe(email);
      })//At the end of this test
      .end((err) => {
        if (err) {//If an error has occured, return done with error as arg
                  //that it will print
          return done(err);
        }
        //Finally, if here: find the user using the email,
        //with that result check if not null and check if passwords are not the
        //same means it was hashed).
        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy();
          expect(user.password).not.toBe(password);
          done();
        });
      });
  });

//We're posting to /users, sending email and apssword props in an object.
//However, the email one is invalid so we're expecting a 400 code
  it('Should return a validation error', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
      .expect(400)
      .end(done);
  });


  //Should return a msg that user's email has been used
  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'Password123!'
      })
      .expect(400)
      .end(done);
  });
});

//Testing the login itself
describe('POST /users/login', () => {
  //Should REJECT invalid login
  it('Should reject the invalid login info', (done) => {
    request(app)
    .post('/users/login')
    .send({
      email:users[1].email,
      password:users[1].password + 'abc'
    })
    .expect(400)
    .expect((res) => {
      expect(typeof res.headers['x-auth']).toBe('undefined');
    })
    .end((err, res) => {
      //Error catching
      if(err){
        return done(err);
      }

      //Since we're dealing with the second user, we expect him
      //But he shouldn't have any tokens tho
      User.findById(users[1]._id).then((user) => {
        //Expect length of tokens to be still 0 since not authorized
        expect(user.tokens.length).toBe(0);
        done();
      }).catch((e) => done(e));
    });
  });

  //Similar, but this time we expect the x-auth header to exist
  //As well as  have a token auth, of type 'auth'
  it('User should get logged in', (done) => {
  request(app)
    .post('/users/login')
    .send({
      email: users[1].email,
      password: users[1].password
    })
    .expect(200)
    .expect((res) => {
      //Expect it to be there
      expect(res.headers['x-auth']).toBeTruthy();
    })
    .end((err, res) => {
      if (err) {
        return done(err);
      }
      //Recall that beforeEach will have deleted the previous test
      //Find that user in the db, check if token is: 1. access: 'auth"
      //and the same one we got back since upon creation it is inserted
      //Because we save the user (with that token prop) before returning it
      //In the /login
      User.findById(users[1]._id).then((user) => {
        expect(user.tokens[0].access).toBe('auth');
        expect(user.tokens[0].token).toBe(res.headers['x-auth']);
        done();
      }).catch((e) => done(e));
    });
});

});

//Here, testing the deletion of the token
//Works in real life but test not passing. Header won't take the x-auth!
describe('DELETE users/me/token', () => {
  it('Should remove the auth token thus log the user out', (done) =>{
    request(app)
    .delete('/users/me/token')
    //Set the header of this request manually since a test
    .set("x-auth", users[0].tokens[0].token)
    .expect(200)
    .end(

      //At the end, we get either error or result
      (err, res) => {
      //If an error, end it there
      if(err){
        return done(err);
      }

      //But now the user token (of type auth) should not be there.
      //And since it's the only token we've given here (recall: beforeEach used to clear)
      //Therefore the length should be 0
      User.findById(users[0]._id).then((user) => {
        //For our first user that we created, check db -> no tokens
        expect(user.tokens.length).toBe(0);
        done();
      }).catch((e) => done(e));
    });
  })
});
