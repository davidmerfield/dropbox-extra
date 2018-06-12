var debug = require('debug')('dropbox-extra:remove');
var normalizePath = require('../util/normalizePath');
var addTimeout = require('../util/addTimeout');
var Check = require('../util/check');

module.exports = function (client) {

  return function (input, callback) {

    callback = addTimeout(callback);

    if (typeof input === 'string') {
    
      removeSingle(client, normalizePath(input), callback);

    } else if (Array.isArray(input) && input.length === 0) {

      callback(null, false);

    } else if (Array.isArray(input) && input.length === 1) {
    
      removeSingle(client, normalizePath(input[0]), callback);
    
    } else if (Array.isArray(input) && input.length > 1) {

      removeMultiple(client, input.map(function(item){

        var entry;

        if (typeof item === 'string') {
          entry = {path: normalizePath(item)};
        } else if (typeof item === 'object' && typeof item.path === 'string') {
          entry =  {path: normalizePath(item.path)};
        }

        return entry;

      }), callback);

    } else {

      callback(new TypeError('Pass a string or array of strings'));
    }
  };
};

function removeSingle (client, path, callback) {

  var status = false, err = null;

  debug(path, 'is about to be deleted');

  client.filesDelete({path: path}).then(function(res){

    status = true;
    debug(res, status);
    callback(err, status);

  }).catch(function(err){

    debug('Error status:', err.status);
    debug('Error summary:', err.error.error_summary);

    // We won't return an error for files which
    if (err && err.error.error_summary.indexOf('path_lookup/not_found') > -1) {
      debug('File did not exist');
      err = null;
    }

    callback(err, status);
  });

}

function removeMultiple (client, entries, callback) {

  var status = false;
  var err = null;
  var check = new Check(client, 'filesDeleteBatch');
  
  // We were passed an empty list. That's fine
  // just leave now. There is no work to do. This
  // might happen when emptyDir is called on the root
  // directory for a blog folder that is itself empty
  if (!entries.length) {
    return callback(err, status);
  }

  debug(entries, 'are about to be deleted');

  client.filesDeleteBatch({
    entries: entries
  }).then(check(function(err){

    if (err) return callback(err);

    callback(null, true);

  })).catch(callback);

}