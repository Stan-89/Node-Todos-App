var env = process.env.NODE_ENV || 'development';

if(env === 'development' || env === 'test'){
  //JSON files will be automaticalyl parsed into a variable
  var config = require('./config.json');
  var envConfig = config[env];

  //For each key of the object (ex: mongodb_uri), assign it to process .env
  //Since before: process.env.MONGODB_URI

  //Objects.keys(var).forEach() will do just that
  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  });
}
