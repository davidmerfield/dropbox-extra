var debug = require('debug')('dropbox-extra:writeFile');
var normalizePath = require('../util/normalizePath');

module.exports = function (client) {

  debug('Initialized');

  return function (path, contents, callback) {

    path = normalizePath(path);
    debug(path);

    var arg = {
      path: path,
      contents: contents,
      mode: {'.tag': 'overwrite'},
      autorename: false, // If there's a conflict, have Dropbox try to autorename the file
      mute: false, // Mute notifications of changes in the user's Dropbox client software
      property_groups: [] // List of custom properties to add to file.
    };

    client.filesUpload(arg).then(function(res){

      debug(res);
      callback(null, true);

    }).catch(function(err){

      debug(err);
      callback(err);
    });
  };
};