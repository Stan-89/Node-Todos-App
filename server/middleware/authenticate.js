//We are going to use this function (in authenticate()) to
//Check if the user has submitted a header x-auth with the needed info
var {User} = require('./../models/user.js')

//And the function it itself -> grab header from request
var authenticate = (req, res, next) => {

  //Get the token from the header
  var token = req.header('x-auth');
  //We declared this method in the User as a static method
  User.findByToken(token).then((user) => {
    //If null/does not exist
    if(!user){
      return Promise.reject();
    }

    //Attach it to the request
    //Redundant to attach token tho
    req.user = user;
    req.token = token;
    //We must call next in order to continue
    next();
  }).catch((e) => {
    res.status(401).send();
  });

};

module.exports = {authenticate};
