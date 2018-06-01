var dropboxError = require('../lib/dropboxError');
var notFunction = require('../util/notFunction');

module.exports = function validateCallback (callback) {

  // Ensure the function was invoked with a
  // callback to which we can pass errors.
  if (notFunction(callback)) {
    throw new dropboxError.BADCALLBACK();
  }

};