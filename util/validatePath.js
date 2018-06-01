var dropboxError = require('../lib/dropboxError');
var notString = require('../util/notString');

module.exports = function (val) {
  
  // The path must be a string
  if (notString(val)) {
    throw new dropboxError.BADPATH();
  }

};