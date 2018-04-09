const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
  id:10
};

var token = jwt.sign(data, '123abc');
console.log('Encoded(token)', token);

var decoded = jwt.verify(token, '123abc');
console.log('Decoded', decoded);
