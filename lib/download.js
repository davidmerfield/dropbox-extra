var debug = require('debug')('dropbox-extra:download');
var dropboxStream = require('../util/dropbox-stream');
var fs = require('fs-extra');
var retry = require('../util/retry');
var normalizePath = require('../util/normalizePath');
var addTimeout = require('../util/addTimeout');
var setMtime = require('../util/setMtime');

module.exports = function (accessToken) {

  debug('Initialized');

  return function (source, destination, callback) {
    
    var err = null;
    var stat = false;

    source = normalizePath(source);
    callback = addTimeout(callback);

    retry(callback, function(errHandler){

      var ws, down, metadata;

      try {
        ws = fs.createWriteStream(destination);
      } catch (err) {
        debug('Failed to create writeStream', err);
        return callback(err);
      }

      ws.on('finish', function(){

        setMtime(destination, metadata.client_modified, callback);
      
      }).on('error', errHandler);

      down = dropboxStream.createDropboxDownloadStream({

        token: accessToken,
        
        filepath: source,
        
        chunkSize: 1000 * 1024,
        
        autorename: false
      
      }).on('progress', function(res){
        
        debug('progress', res);
      
      }).on('metadata', function(res){
        
        debug('metadata', res);
        metadata = res;

      }).on('error', errHandler).pipe(ws);

    }, function(err){

      debug(err);

      callback(err, stat);
    });

  };  
};