var dropboxError = require('../lib/dropboxError');
var notString = require('../util/notString');
var notArray = require('../util/notArray');

module.exports = function validatePathOrListOfPaths (val) {
  
  // The path must be a string
  if (notString(val) && notArray(val)) {
    throw new dropboxError.BADPATH();
  }

  // The val must be a list
  if (notString(val)) {

    val.forEach(function(item){

      if (notString(item)) {
        throw new dropboxError.BADPATH();
      }

    });
  }

};