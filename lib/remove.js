var debug = require('debug')('remove');
var normalizePath = require('../util/normalizePath');
var notString = require('../util/notString');
var notFunction = require('../util/notFunction');
var notArray = require('../util/notArray');
var normalizePath = require('../util/normalizePath');
var dropboxError = require('./dropboxError');

function check_until (client, async_job_id, callback){

  debug('checking', async_job_id);

  client.filesDeleteBatchCheck({async_job_id: async_job_id})
    .then(function(res){

      debug(res);
  
      if (res['.tag'] === 'complete') {

        //res.entries refers to an array of entries, could use if needed
         callback(null, true);

      } else if (res['.tag'] === 'failed') {

         callback(new Error('Failed'));

      } else if (res['.tag'] === 'in_progress') {

         check_until(client, async_job_id, callback);
      
      } else {

         callback(new Error('Unexpected response'));
      }

    })
    .catch(callback);
}

module.exports = function (client) {

  return function (input, callback) {

    var path, entries, status = false, err = null;

    if (notFunction(callback)) {
      throw new dropboxError.BADCALLBACK();
    }

    if (notString(input) && notArray(input)) {
      return callback(new TypeError('Pass a string or array'));
    }

    if (typeof input === 'string') {
      path = normalizePath(input);
    } else {
      entries = input.map(normalizePath).map(function(path){
        return {path: path};
      });
    }

    if (path) {

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

    } else {

      // We were passed an empty list. That's fine
      // just leave now. There is no work to do. This
      // might happen when emptyDir is called on the root
      // directory for a blog folder that is itself empty
      if (!entries.length) {
        return callback(err, status);
      }

      client.filesDeleteBatch({
        entries: entries
      }).then(function(res){

        if (res['.tag'] === 'async_job_id') {

            check_until(client, res.async_job_id, function(err){

              debug('HERE too');

              if (err) return callback(err);

              debug('HERE');

              callback(null, true);
            });

          } else {

            callback(new Error('No async_job_id'));
          }

      }).catch(callback);
    }
  };
};