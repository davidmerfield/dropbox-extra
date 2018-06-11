var debug = require('debug')('dropbox-extra:emptyDir');
var normalizePath = require('../util/normalizePath');
var addTimeout = require('../util/addTimeout');
var isRoot = require('../util/isRoot');

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

    // Basic sanity check to ensure arguments make sense
    // will throw an error if something is wrong.
    callback = addTimeout(callback);

    // We don't really need to normalize the path 
    // since this is a higher level method.
    path = normalizePath(path);

    // The user wants to empty the root directory
    // for this Dropbox folder. Dropbox doesn't let
    // you just call client.filesDelete on the root
    // folder so we have to fetch its contents first.
    if (isRoot(path)) {

      debug('emptying root directory');

      // Returns a list of names referring to files
      // and folders in the root directory
      readdir(path, function(err, contents){

        if (err) return callback(err, status);

        // contents is an array of names, e.g.
        // ['foo', 'bar.txt', 'baz.jpg'] without
        // leading slashes, i.e. not full paths.
        // However, since the remove method is
        // liberal in what is accepts, and since
        // all these items are in the root directory
        // we don't need to modify the list at all
        remove(contents, callback);  
      });

    // We want to ensure an empty directory exists,
    // and that directory is not the root directory.
    // Current strategy is to remove anything at that
    // path, then create a directory. I don't know if
    // there are faster ways to accomplish this.
    } else {

      debug('removing', path);

      remove(path, function(err, removeStatus){

        if (err) return callback(err, status);

        debug('making directory', path);

        mkdir(path, function(err, mkdirStatus){

          if (err) return callback(err, status);

          // If either remove or mmkdir modify the
          // user's folder when return this.
          status = removeStatus || mkdirStatus;

          callback(err, status);
        }); 
      });   
    } 
  };
};
