var debug = require('debug')('util:waitForJob');

module.exports = function waitForJob (client, methodName) {

  return function (callback) {

    return function (res) {

      debug('middleware invoked for first time', res);

      // The async job was initiated as has this 
      // particular identifier, which we'll use to
      // check its status.
      if (res['.tag'] === 'async_job_id') {

        check_until(client, methodName, res.async_job_id, function(err){

          debug('check_until callback invoked');

          debug(err);

          if (err) return callback(err);

          callback(null, true);
        });

      // The async job finished immediately
      } else if (res['.tag'] === 'complete') {


      } else {

        callback(new Error('No async_job_id'));
      }
    };
  };
};

function check_until (client, methodName, async_job_id, callback){

  debug('check_until invoked');
  debug(async_job_id);

  client[methodName]({async_job_id: async_job_id})

    .then(function(res){
  
      debug('check_until callback invoked', res);

      if (res['.tag'] === 'complete') {

        // some of these entries might have failed
        // some might have succeeded
        debug(res.entries);

        //res.entries refers to an array of entries, could use if needed
        callback(null, true);

      } else if (res['.tag'] === 'failed') {

         callback(new Error('Failed'));

      } else if (res['.tag'] === 'in_progress') {

         check_until(client, methodName, async_job_id, callback);
      
      } else {

         callback(new Error('Unexpected response'));
      }

    })

    .catch(function(err){

      debug('check_until err', err);
    });
}