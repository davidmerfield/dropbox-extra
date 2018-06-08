var debug = require('debug')('dropbox-extra:stat');
var normalizePath = require('../util/normalizePath');
var Retry = require('../util/retry');
var addTimeout = require('../util/addTimeout');
var validateCallback = require('../util/validateCallback');
var validatePath = require('../util/validatePath');
var addTimeout = require('../util/addTimeout');
var copy = require('../util/copy');
var logErr = require('../util/logErr');

// The purpose of stat is to mimic the information
// provided by fs.stat. It will return the full information
// from dropbox, with a few useful additions:
// - isDirectory
// - isFile
// - mtime

module.exports = function (client) {

  return function stat (path, callback) {

    var arg;
    var err = null;
    var stat = null;
    var retry = new Retry();

    validateCallback(callback);
    validatePath(path);

    // We will timeout after. This also
    // guarantees that callback is only called once.
    callback = addTimeout(callback);

    // We'll pass this to the Dropbox API
    // http://dropbox.github.io/dropbox-sdk-js/global.html#FilesGetMetadataArg
    arg = {

      // The path to the file or folder, normalized
      // to prevent the issue with a leading slash
      path: normalizePath(path),

      // Dropbox offers metadata for deleted
      // files and folders, but we want stat to 
      // behave like it does on the fs, so a request
      // to a deleted file or folder should return
      // ENOENT, rhat
      include_deleted: false,

      // I don't believe the mediainfo object is
      // useful for mocking the fs.stat object
      include_media_info: false,

      // We don't care whether a file or folder
      // has other shared memebers. So no thanks.
      include_has_explicit_shared_members: false
    };

    debug(arg);

    // This method works for files and folders
    // we copy the argument because the Dropbox
    // sdk sometimes modifies the arg object
    // passed to some of its methods...
    // https://github.com/dropbox/dropbox-sdk-js/issues/202
    client.filesGetMetadata(copy(arg))
      .then(onRes)
      .catch(onErr)
      .catch(logErr);

    // Called on receipt of a successful
    // response from the Dropbox API.
    function onRes (res){

      stat = res;

      stat.isFile = function (){
        return res['.tag'] === 'file';
      };

      stat.isDirectory = function (){
        return res['.tag'] === 'folder';
      };

      // we don't know atime, utime or birthtime 
      // as far as I can tell...
      if (stat.isFile()) {
        stat.mtime = new Date(res.client_modified);
      }
    
      // We don't need to add size, it is there already
      // stat.size = res.size;
      
      callback(err, stat);
    }

    // Called on receipt of a successful
    // response from the Dropbox API.
    function onErr (err){

      if (retry.maxed()) {
        debug(path, '.. maxed number of retries so leave now');
        return callback(err, stat);
      }

      // Add useful codes here...
      // https://nodejs.org/api/errors.html#errors_common_system_errors      
      // ENOENT

      if (ENOENT(err)) {
        err.code = 'ENOENT';
      }

      if (retry.cannot(err)) {
        debug(path, '.. cant retry this error', err);
        return callback(err, stat);
      }

      debug(path, '.. waiting to retry...');

      retry.wait(err, function(){

        debug(path, '.. retrying now', arg);

        client.filesGetMetadata(copy(arg))
          .then(onRes)
          .catch(onErr)
          .catch(logErr);
      });
    }
  };
};

function ENOENT (err) {
 
  return err &&
         err.error && 
         err.error.error_summary &&
         err.error.error_summary.indexOf('path/not_found') > -1;
}

/* 

Example FS stat response for file

{ dev: 16777220,
  mode: 33188,
  nlink: 1,
  uid: 501,
  gid: 20,
  rdev: 0,
  blksize: 4096,
  ino: 7340899,
  size: 3,
  blocks: 8,
  atime: Mon Jun 04 2018 18:44:22 GMT-0400 (EDT),
  mtime: Mon Jun 04 2018 18:44:22 GMT-0400 (EDT),
  ctime: Mon Jun 04 2018 18:44:22 GMT-0400 (EDT),
  birthtime: Mon Jun 04 2018 18:44:22 GMT-0400 (EDT) }
  
Example db filesGetMetadata for file

{ '.tag': 'file',
  name: 'test.txt',
  path_lower: '/test.txt',
  path_display: '/test.txt',
  id: 'id:QyP4Dz-HY8AAAAAAAAABqg',
  client_modified: '2018-06-04T23:05:07Z',
  server_modified: '2018-06-04T23:05:07Z',
  rev: '353bfcd6480',
  size: 3,
  content_hash: '7ed50d750640b7f6626f7c6e3b63f7db6de0c0ceaa8d919e78eaa37993bfcab9' }
   */