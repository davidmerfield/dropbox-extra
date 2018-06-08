var initial = require('./initial');
var withCursor = require('./withCursor');
var debug = require('debug')('dropbox-extra:sync');

module.exports = function (client, download) {

  return function () {

    var dropboxPath, localPath, callback, cursor;

    // First sync of the two folders
    if (arguments.length === 3) {

      dropboxPath = arguments[0];
      localPath = arguments[1];
      callback = arguments[2];
      
      debug('running initial sync from Dropbox', dropboxPath, 'to local', localPath);
      initial(client, download, dropboxPath, localPath, callback);

    // Subsequent sync
    } else if (arguments.length === 4) {

      dropboxPath = arguments[0];
      localPath = arguments[1];
      cursor = arguments[2].cursor;
      callback = arguments[3];
      
      debug('running sync with cursor');      
      withCursor(client, download, dropboxPath, localPath, cursor, callback);

    } else {

      throw new Error('Bad arguments');
    }
  };
};