var dropboxStream = require('../util/dropbox-stream');
var fs = require('fs-extra');
var debug = require('debug')('dropbox-extra:upload');

module.exports = function (accessToken) {

  debug('Initialized');

  return function (source, destination, callback) {

    debug(source, destination, accessToken);
    
    var arg, up;

    arg = {
      token: accessToken,
      filepath: destination,
      chunkSize: 1000 * 1024,
      autorename: false
    };

    up = dropboxStream.createDropboxUploadStream(arg)
      .on('error', function(err){
        debug(err);
        callback(err);
      })
      .on('progress', function(res){
        debug('progress',res);
      })
      .on('metadata', function(res){
        debug('metadata',res);
        callback();
      });

    fs.createReadStream(source).pipe(up)
      .on('finish', function(res){
        // fires before metadata
        debug('read done', res);
      });
    };  
};