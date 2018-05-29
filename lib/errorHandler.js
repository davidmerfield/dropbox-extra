var debug = require('debug')('errorHandler');

module.exports = function (callback) {
  
  debug('Initialized error handler');

  return function (err) {

    debug('Called error handler');

    // check if should retry for this error
    
    callback(err);
  };

};