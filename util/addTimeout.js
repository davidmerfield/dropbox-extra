var DEFAULT_LENGTH = 60 * 1000; // 60s
var validateCallback = require('./validateCallback');

// This function is to add a timeout around 
// requests to Dropbox's API, which sometimes
// seem to hang in as yet unreproducible 
// circumstances. I would love to remove this.
module.exports = function (callback, len) {
  
  var err;
  var called;
  var timeout;

  validateCallback(callback);

  timeout = setTimeout(function(){

    err = new Error('Timed out');

    // Taken from 
    err.code = 'ETIMEDOUT';

    // Not sure what the appropriate status is
    err.status = 504;

    callback(err);

  }, len || DEFAULT_LENGTH);

  return function callbackWithTimeout () {

    if (called) {
      return;
    }

    callback.apply(this, arguments);
    clearTimeout(timeout);
    called = true;
  };
};