var debug = require('debug')('dropbox-extra:stat');
var normalizePath = require('../util/normalizePath');
var addTimeout = require('../util/addTimeout');
var addTimeout = require('../util/addTimeout');
var retry = require('../util/retry');
var logErr = require('../util/logErr');
var summary = require('../util/summary');

// The purpose of stat is to mimic the information
// provided by fs.stat. It will return the full information
// from dropbox, with a few useful additions:
// - isDirectory
// - isFile
// - mtime
module.exports = function (client) {

  return function stat (path, callback) {

    var err = null;
    var stat = null;
    
    // Check callback is function, ensure it is called
    // only once, add an automatic timeout to it.
    callback = addTimeout(callback);
    path = normalizePath(path);

    // Will invokve the function passed as first argument
    // initially, and subsequently depending on the error
    retry(callback, function (errHandler) {
  
      // We'll pass this to the Dropbox API
      // http://dropbox.github.io/dropbox-sdk-js/global.html#FilesGetMetadataArg
      client.filesGetMetadata({

        // Check the path is a string, and has slash
        path: path,

        // Dropbox offers metadata for deleted
        // files and folders, but we want stat to 
        // behave like it does on the fs
        include_deleted: false,

        // The mediainfo object does not seem is
        // useful for mocking the fs.stat object
        include_media_info: false,

        // Shared members refers to other Dropbox
        // users with access to the file or folder.
        include_has_explicit_shared_members: false

      }).then(function(res){

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

      }).catch(errHandler).catch(logErr);      

    }, function (err) {

      // only invoked if it is possible to retry

      // Add useful codes here...
      // https://nodejs.org/api/errors.html#errors_common_system_errors      
      // ENOENT

      debug(summary(err));
      
      if (summary(err) === 'path/not_found') {
        err.code = 'ENOENT';
      }

      callback(err, stat);
    });
  };
};



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