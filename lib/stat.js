var debug = require('debug')('dropbox-extra:stat');
var normalizePath = require('../util/normalizePath');

module.exports = function (client) {

  debug('Initialized');

  return function stat (path, callback) {

    var arg;
    var err = null;
    var stat = null;

    path = normalizePath(path);
    debug(path);
    arg = {
      include_deleted: false,
      include_media_info: false,
      path: path,
      include_has_explicit_shared_members: false
    };

    client.filesGetMetadata(arg).then(function(res){

      stat = res;

      stat.isFile = function (){
        return res['.tag'] === 'file';
      };

      stat.isDirectory = function (){
        return res['.tag'] === 'folder';
      };

      // we don't know atime, utime or birthtime 
      // as far as I can tell...
      stat.mtime = new Date(res.client_modified);

      stat.size = res.size;

      callback(err, stat);

    }).catch(function(err){

      // need to catch retryable errors
      callback(err, stat);
    });
  };
};

/* 
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