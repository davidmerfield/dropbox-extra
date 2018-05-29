var debug = require('debug')('remove');
var normalizePath = require('./normalizePath');
var errorHandler = require('./errorHandler');

module.exports = function (client) {

  debug('Initialized');

  return function (path, callback) {

    if (typeof callback !== 'function') {
      throw new TypeError('Pass a callback to dropbox-extra.remove');
    }

    if (typeof path !== 'string') {
      return callback(new TypeError('Pass a string to dropbox-extra.remove'));
    }

    path = normalizePath(path);
    debug(path);
    var status = false;
    var err = null;

    var handleErr = errorHandler(function(err){

      debug('Error status:', err.status);
      debug('Error summary:', err.error.error_summary);

      // We won't return an error for files which
      if (err && err.error.error_summary.indexOf('path_lookup/not_found') > -1) {
        debug('File did not exist');
        err = null;
      }

      callback(err, status);
    });

    client.filesDelete({path: path}).then(function(res){

      status = true;
      debug(res, status);
      callback(err, status);

    }).catch(handleErr);
  };
};