var debug = require('debug')('move');
var normalizePath = require('../util/normalizePath');
var join = require('path').join;

function check_until (client, async_job_id, callback){

  debug('checking', async_job_id);

  client.filesMoveBatchCheck({async_job_id: async_job_id})
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

module.exports = function (client, readdir) {

  debug('Initialized');

  return function (source, destination, callback) {

    if (typeof callback !== 'function') {
      throw new TypeError('Pass a callback to dropbox-extra.move');
    }

    if (typeof source !== 'string') {
      return callback(new TypeError('Pass a string to dropbox-extra.move'));
    }

    if (typeof destination !== 'string') {
      return callback(new TypeError('Pass a string to dropbox-extra.move'));
    }


    source = normalizePath(source);
    destination = normalizePath(destination);
    debug(source, destination);

    // Moving from or to the root directory needs to be handled differently
    if (source === '' || destination === '') {

      readdir(source, function(err, contents){

        var entries = contents.map(function(name){
          return {
            from_path: normalizePath(join(source, name)),
            to_path: normalizePath(join(destination, name))
          };
        });

        var arg = {
          allow_shared_folder: true,
          autorename: false,
          allow_ownership_transfer: true,
          entries: entries,
        };

        client.filesMoveBatch(arg).then(function(res){

          debug(res);

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
      });

    // Something other than the root directory
    } else {

      client.filesMove({
        from_path: source,
        to_path: destination,
        allow_shared_folder: true,
        autorename: false,
        allow_ownership_transfer: true
      }).then(function(res){
        debug(res);
        callback(null);
      }).catch(callback);

    } 
  };
};