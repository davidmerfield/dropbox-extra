var debug = require('debug')('dropbox-extra:upload');
var dropboxStream = require('../util/dropbox-stream');
var fs = require('fs-extra');
var retry = require('../util/retry');
var normalizePath = require('../util/normalizePath');
var addTimeout = require('../util/addTimeout');

module.exports = function (accessToken) {

  debug('Initialized');

  return function (source, destination, callback) {
    
    var err = null;
    var stat = false;

    destination = normalizePath(destination);
    callback = addTimeout(callback);

    retry(callback, function(errHandler){

      var up = dropboxStream.createDropboxUploadStream({

        token: accessToken,
        
        filepath: destination,
        
        chunkSize: 1000 * 1024,
        
        autorename: false
      
      }).on('progress', function(res){
        
        debug('progress', res);
      
      }).on('metadata', function(res){
        
        debug('metadata', res);

        callback(err, stat = true);

      }).on('error', errHandler);

      fs.createReadStream(source).pipe(up).on('finish', function(res){

        // fires before metadata
        debug('read done', res);

      }).on('error', errHandler);

    }, function(err){

      debug(err);

      callback(err, stat);
    });

  };  
};