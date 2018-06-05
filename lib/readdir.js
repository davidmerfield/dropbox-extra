var debug = require('debug')('dropbpx-extra:readdir');
var normalizePath = require('../util/normalizePath');
var Retry = require('../util/retry');
var logErr = require('../util/logErr');

module.exports = function (client) {

  debug('Initialized');

  return function (path, callback) {
    
    debug(path);
    path = normalizePath(path);

    var err = null;
    var retry = new Retry();
    var contents = [];
    var arg = {
      path: path,
      recursive: false,
      include_media_info: false,
      include_deleted: false,
      limit: 100,
      // Results will include entries under mounted folders 
      // which includes app folder, shared folder and team folder.
      include_mounted_folders: true
    };

    function onRes (res){
  
      contents = contents.concat(res.entries.map(function(item){
        return item.name;
      }));

      if (res.has_more) {
        
        debug('reading more!', contents);

        client.filesListFolderContinue({cursor: res.cursor})
          .then(onRes)
          .catch(onErr)
          .catch(logErr);

      } else {

        debug('read complete!', contents);
        callback(null, contents);
      }
    }

    function onErr (err){

      if (retry.maxed()) {
        debug(path, 'maxed number of retries so leave now');
        return callback(err);
      }

      // implement any custom logic here 
      // depending on error

      // the code or status is not retryable
      if (retry.cannot(err)) {
        debug(path, 'cant retry this error', err);
        return callback(err);
      }

      debug(path, 'waiting to retry...');

      // Wait is determine by the error
      // or the number of existing retries
      retry.wait(err, function(){
        client.filesListFolder(Object.assign({}, arg))
          .then(onRes)
          .catch(onErr)
          .catch(logErr);
      });
    }

    client.filesListFolder(Object.assign({}, arg))
      .then(onRes)
      .catch(onErr)
      .catch(logErr);

  };
};