const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var password = '123abc!';


//Note: callback functions are sync, since they take some time
//Sooo won't be executed linearly (for results)

//Note: brypt will salt a password with n number of rounds
//It's generally slow, so the bigger the number -> the better the salting
bcrypt.genSalt(10, (err, salt) => {
  //Here, the salt (2nd argument) is created.
  //We can then proceed to hash

  //First arg: the password we want to hash, 2nd: the salt, third -> callback
  bcrypt.hash(password, salt, (err, hash) => {
    console.log(hash);
  });
});

//This is our hashed password, with salt 10
var hashedPassword = '$2a$10$huAU4qTnQuGPifHEXfV9cOmPJ7p61oKaoXrY1WviiDAznE/rW8oLK';

//We compare it -> without specifying salt or rounds
//Res is true or false
bcrypt.compare('123abc!', hashedPassword, (err, res) => {
  console.log(res);
});

// var data = {
//   id: 10
// };
//
// var token = jwt.sign(data, '123abc');
// console.log(token);
//
// var decoded = jwt.verify(token, '123abc');
// console.log('decoded', decoded);

// var message = 'I am user number 3';
// var hash = SHA256(message).toString();
//
// console.log(`Message: ${message}`);
// console.log(`Hash: ${hash}`);

// var data = {
//   id: 4
// };
// var token = {
//   data,
//   hash: SHA256(JSON.stringify(data) + 'somesecret').toString()
// }
//
//
// // token.data.id = 5;
// // token.hash = SHA256(JSON.stringify(token.data)).toString();
//
//
// var resultHash = SHA256(JSON.stringify(token.data) + 'somesecret').toString();
// if (resultHash === token.hash) {
//   console.log('Data was not changed');
// } else {
//   console.log('Data was changed. Do not trust!');
// }
