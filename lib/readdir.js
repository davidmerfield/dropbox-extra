var debug = require('debug')('readdir');
var normalizePath = require('../util/normalizePath');

module.exports = function (client) {

  debug('Initialized');

  return function (path, callback) {
    
    path = normalizePath(path);
    debug(path);

    var contents = [];
    var arg = {

      path: path,
      recursive: false,
      include_media_info: false,
      include_deleted: false,

      // Results will include entries under mounted folders 
      // which includes app folder, shared folder and team folder.
      include_mounted_folders: true,

    };

    var handleErr = function(err, retry){

      if (retry) {

        debug(err);
        callback(err);

      } else {

        debug(err);
        callback(err);
      }
    };

    client.filesListFolder(arg).then(function handleList (res){

      contents = contents.concat(res.entries.map(function(item){
        return item.name;
      }));

      if (res.has_more) {
        
        debug('reading more!');
        
        client.filesListFolderContinue({cursor: res.cursor})
          .then(handleList)
          .catch(handleErr);

      } else {

        debug(contents);
        callback(null, contents);
      }
    })
    .catch(handleErr);
  };
};