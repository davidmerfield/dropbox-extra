var debug = require('debug')('mkdir');
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

    // Root directory exists
    if (path === '') {
      return callback(err, status);
    }

    var handleErr = errorHandler(function(err){

      debug('Error status:', err.status);
      debug('Error summary:', err.error.error_summary);

      if (err && err.error.error_summary.indexOf('path/conflict/folder') > -1) {
        debug('Folder already existed');
        err = null;
      }

      callback(err, status);
    });

    client.filesCreateFolder({path: path, autorename: false}).then(function(res){

      status = true;
      debug(res, status);
      callback(err, status);

    }).catch(handleErr);
  };
};