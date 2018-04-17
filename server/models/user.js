//Mongoose since it will be our framework for the object.
const mongoose = require('mongoose');
//Validator: we want to check if it is an email
const validator = require('validator');

//We need it to generate the token
const jwt = require('jsonwebtoken');

//LoDash
const _ = require('lodash');

//Bcrypt
const bcrypt = require('bcryptjs');

//Instead of straight up defining the model, we're going to use a Schema
//Which is exactly the same thing, but in a different var
//We can't add methods onto User, but we can with a schema
var UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    //Will trim white space around it
    trim: true,
    minlength: 1, //Only one may be contained in the DB at a time
    unique: true,
    //CUSTOM Requirement (we could have used any name)
    //CUSTOM VALIDATORS (on Moongoosejs.com): validate takes two props,
    //a validator that returns true or false,
    //and a message with {VALUE} in case it fails
    validate: {
      validator: validator.isEmail,
      message: '{VALUE} is not a valid email'
    }
  },
  password: {
    type: String,
    require: true,
    minlength: 6
  },
  /* Tokens is an array. Feature available in MongoDB
     In this nested document, we access how we give access to users
  */
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    },
    _id: false
  }]
});

//Adding methods to the UserSchema
//Note: methods HAVE access to schema info
//Recall: ARROW FUNCTIONS DO NOT BIND this.
UserSchema.methods.generateAuthToken = function(){
  var user = this;
  //Note: .push sometimes causes problems with some versions of MongoDB, use concat
  var access = 'auth'; //What we're going to use to "identify" our token (to ourselves)

  //Sign it (Create the token) recall: first arg: object, 2nd arg: secret.
  //toString so we can cast it
  //Recall that every model has this._id.toHexString() that gives us hex string (url possible)
  var token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

  //We defined that we wanted this structure.
  //NOte: concat produces strange behaviour (_id in the token ???)
  //user.tokens = user.tokens.concat([{access, token}]);
  //user.tokens[user.tokens.length] = {access, token};
  user.tokens.push({access, token});

  //Returns a promise
  return user.save().then(()=>{
    return token;
  });

  /*
  returning a user.save().then(() => {return token}) [since user.save is async]
  is the same thing as user.save().then(...).then((returnedFromFirstThen) ... )
  that's why: RETURN the PROMISE WITH A RETURN TOKEN IN ITS OWN RETURN
  //IN ORDER FOR IT TO BE CALLED ELSEWHERE
  */
};

//Removing a token (non-static method, so applies to current obj)
UserSchema.methods.removeToken = function(token){
  //Keep the context
  var user = this;

  //Since async operations, we have to return async
  //(update is async)

  //Recall that in update (mods), we can use $pull to pull stuff
  return user.update({
    $pull: {
      tokens: {token}
    }
  });

};

//We can also OVERRIDE a method (.toJSON so we can determine what we can print)
UserSchema.methods.toJSON = function(){
  var user = this;

  //Note: user.toObject() will take a Mongoose variable and convert it to
  //a "real" js object where only the properties now exist
  userObject = user.toObject();

  //Recall that _.pick (loDash, so import it) first arg: the object we're going
  //to pick from, second: array with the name of the proeprties we're salvaging
  return _.pick(userObject, ['_id', 'email']);
};

//We will create a STATIC method to find by token
UserSchema.statics.findByToken = function(token){
  //Easier to understand context
  var User = this;
  var decoded;

  //Here we verify the given token (provided arg) with the secret code
  //To see that it's a match.
  //Out of the token, recall that we're able to get the object that was used
  //to create that token (through json)
  try
  {
    //Recall that .verify(token, secret) will not only verify but also
    //return the object decoded if successful (if not, will throw error)
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  }
  catch(e)
  { //Note: through Mongoose, we have access to Promise
    //So we REJECT instead of resolving
    return Promise.reject();
  }

  //Now that we have the info decoded, let's look for it
  //Recall that ModelName.findById exists. It will look into our collection
  //from the provided arguments.
  //And straight up return the result
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  });

  //Note: here, we know that it's about authorizing, so access is auth
  //We decode the id of the user (that is, the objectID that was created)
  //And the tokenthat should match, since we generated and saved it upon creation
};

//We need a static method that would allow us to check if a certain user
//exists given an email and a password (for login)
UserSchema.statics.findByCredentials = function(email, password){
  //To keep the context
  var User = this;

  //Since this contains promises, we must return a promise in order to obtain
  //the async result

  //First, there must be a match
  return User.findOne({email}).then((user) => {
    //If no result, reject
    //Recall that Promise comes with the model (inside of it)
    if(!user){
      return Promise.reject();
    }
    //Since this is NOT an async, we need to return it in the form of a promise
    return new Promise((resolve, reject) => {
      //Compare the given password to the one saved in the db, using bcrypt
      //Recall that for comparison, bcrypt doesn't need the rounds of salting
      bcrypt.compare(password, user.password, (err, res) => {
        //Recall that inside a Promise, we can resolve() and reject()
        //If result is true, then great success
        if(res){
          //Resolve this promise, return the user var that was found with mail
          resolve(user);
        }
        else{
          reject();
        }
      });
    });
  });
};


//We use the .pre for this model (on the schema): before saving
UserSchema.pre('save', function(next){
  //Keeping track of where we are (context)
  var user = this;

  //Important to use next since it will allow this to continue

  //modelEntity.isModified('nameOfProp') //returns true if that prop was modded and not saved
  if(user.isModified('password')){
    //We're here if the password was modified
    bcrypt.genSalt(10, (err, salt) => {
      //Salt created, time to hash
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  }
  else{
    //If not, next() //repetition since it's async
    next();
  }
});


//Our model
var User = mongoose.model('User', UserSchema);
module.exports = {User}
