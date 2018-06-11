function (client, method, callback){

  return function (callback) {

    function check () {

      client[method + 'Check']({

        async_job_id: res.async_job_id

      }).then(function(){

        if (res['.tag'] === 'complete') {

           callback(null, res);

        } else if (res['.tag'] === 'failed') {

           callback(new Error('Failed'));

        } else if (res['.tag'] === 'in_progress') {

           checkUntil(client, async_job_id, callback);
        
        } else {

           callback(new Error('Unexpected response'));
        }

      }).catch(callback);
    }

    return function (res) {

      if (res['.tag'] === 'async_job_id') {

        check();

      } else {

      }

    }         
  };
}