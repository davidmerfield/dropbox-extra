var debug = require('debug')('dropbpx-extra:readdir');
var normalizePath = require('../util/normalizePath');
var retry = require('../util/retry');
var logErr = require('../util/logErr');

module.exports = function (client) {

  debug('Initialized');

  return function (path, callback) {
    
    debug(path);
    path = normalizePath(path);

    var err = null;
    var contents = [];

    retry(callback, function(errHandler){

      client.filesListFolder({

        path: path,
        recursive: false,
        include_media_info: false,
        include_deleted: false,
        limit: 100,
        // Results will include entries under mounted folders 
        // which includes app folder, shared folder and team folder.
        include_mounted_folders: true

      }).then(function onRes (res){
    
        contents = contents.concat(res.entries.map(function(item){
          return item.name;
        }));

        if (res.has_more) {
        
          debug('reading more!', contents);

          client.filesListFolderContinue({

            cursor: res.cursor

          }).then(onRes).catch(errHandler).catch(logErr);
        
        } else {

          debug('read complete!', contents);
          callback(err, contents);
        }

      }).catch(errHandler).catch(logErr);

    }, function (err){

      debug(err);
      
      callback(err);
    });
  };
};