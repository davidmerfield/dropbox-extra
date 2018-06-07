var dropboxStream = require('../../util/dropbox-stream');
var setMtime = require('../../util/setMtime');
var fs = require('fs-extra');
var debug = require('debug')('dropbox-extra:download');
var normalizePath = require('../../util/normalizePath');

module.exports = function (accessToken) {

  debug('Initialized');

  return function (source, destination, callback) {

    fs.ensureFile(destination, function(err){

      var metadata;

      if (err) return callback(err);

      debug(source, destination, accessToken);

      dropboxStream.createDropboxDownloadStream({
        token: accessToken,
        filepath: normalizePath(source)
      })
      .on('error', function(err){
        debug(err);
        callback(err);
      })
      .on('metadata', function(res){
        metadata = res;
      })
      .on('progress', function(progress){
        debug(progress);
      })
      .pipe(fs.createWriteStream(destination))
      .on('finish', function(){
        debug('Complete!');
        setMtime(destination, metadata.client_modified, callback);
      });
    });
  };  
};