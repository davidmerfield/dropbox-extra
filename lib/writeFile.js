var debug = require('debug')('dropbox-extra:writeFile');
var normalizePath = require('../util/normalizePath');
var Retry = require('../util/retry');

module.exports = function (client) {

  debug('Initialized');

  return function writeFile (path, contents, callback) {

    var arg;
    var err = null;
    var status = false;
    var retry = Retry(writeFile, arguments);

    path = normalizePath(path);
    debug(path);

    arg = {
      path: path,
      contents: contents,
      mode: {'.tag': 'overwrite'},
      autorename: false, // If there's a conflict, have Dropbox try to autorename the file
      mute: false, // Mute notifications of changes in the user's Dropbox client software
      property_groups: [] // List of custom properties to add to file.
    };

    client.filesUpload(arg).then(function(){

      /* res = { 
          name: 'test.txt',
          path_lower: '/test.txt',
          path_display: '/test.txt',
          id: '...',
          client_modified: '2018-06-04T18:29:00Z',
          server_modified: '2018-06-04T18:29:00Z',
          rev: '...',
          size: 3,
          content_hash: '...' 
        } */
        
      status = true;
      callback(err, status);

    }).catch(retry(function(err){

      debug(err);

      callback(err, status);
    });
  };
};