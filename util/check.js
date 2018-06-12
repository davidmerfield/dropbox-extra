module.exports = function (client, method){

  return function (callback) {

    function check (async_job_id) {

      client[method + 'Check']({

        async_job_id: async_job_id

      }).then(function(res){

        if (res['.tag'] === 'complete') {

           callback(null, res);

        } else if (res['.tag'] === 'failed') {

           callback(new Error('Failed'));

        } else if (res['.tag'] === 'in_progress') {

           check(async_job_id);
        
        } else {

           callback(new Error('Unexpected response'));
        }

      }).catch(callback);
    }

    return function (res) {

      if (res['.tag'] === 'async_job_id') {

        check(res.async_job_id);

      } else {

        callback(new Error('Unexpected response'));
      }
    };       
  };
};