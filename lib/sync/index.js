var initial = require('./initial');
var withCursor = require('./withCursor');
var debug = require('debug')('dropbox-extra:sync');

module.exports = function (client, download) {

  return function () {

    var dropboxPath, localPath, callback, cursor;

    if (arguments.length === 3) {

      dropboxPath = arguments[0];
      localPath = arguments[1];
      callback = arguments[2];
      
      debug('running initial sync from Dropbox', dropboxPath, 'to local', localPath);
      initial(client, download, dropboxPath, localPath, callback);

    } else if (arguments.length === 2) {

      cursor = arguments[0];
      callback = arguments[1];

      debug('running sync with cursor');      
      withCursor(cursor, callback);

    } else {

      throw new Error('Bad arguments');
    }
  };
};