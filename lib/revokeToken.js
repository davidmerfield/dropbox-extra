module.exports = function (client) {

  return function (callback) {

    client.authTokenRevoke().then(function(){

      callback();

    }).catch(function(err){

      callback();
    });

  };
};