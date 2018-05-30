var debug = require('debug')('remove');
var async = require('async');
var dropboxError = require('./dropboxError');
var isRoot = require('../util/isRoot');
var notString = require('../util/notString');
var notFunction = require('../util/notFunction');
var normalizePath = require('../util/normalizePath');

// Ensures that a directory exists and is empty. It
// deletes directory contents if the directory is not
// empty. If the directory does not exist, it is created.
// The directory itself is not deleted. It will overwrite
// an existing file which shares the same name.
module.exports = function init (readdir, remove, mkdir) {

  return function emptyDir (path, callback) {

    // status refers to whether or not changes were
    // made to the user's folder to ensure the an 
    // empty directory exists at the given path
    var status = false;

    // Ensure the function was invoked with a
    // callback to which we can pass errors.
    if (notFunction(callback)) {
      throw new dropboxError.BADCALLBACK();
    }

    // The path must be a string
    if (notString(path)) {
      return callback(new dropboxError.BADPATH(), status);
    }

    // Add leading slash to a path if it doesn't have one
    // If the path refers to the root directory, it is 
    // replaced with an empty string.
    path = normalizePath(path);

    // The user wants to empty the root directory
    // for this Dropbox folder. Dropbox doesn't let
    // you just call client.filesDelete on the root
    // folder so we have to fetch its contents first.
    if (isRoot(path)) {

      // Returns a list of names referring to files
      // and folders in the root directory
      readdir(path, function(err, contents){

        // Remove accepts an array of paths in addition
        // to a single path, so just pass it there
        // unmolested. We depend on remove returning a status
        // as the second argument to the callback
        remove(contents, callback);  
      });

    // Something other than the root directory
    } else {

      remove(path, function(err){

        if (err) return callback(err, status);

        mkdir(path, function(err){

          if (err) return callback(err, status);

          status = true;
          callback(err, status);
        }); 
      });   
    } 
  };
};
