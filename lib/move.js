var debug = require('debug')('dropbox-extra:move');
var normalizePath = require('../util/normalizePath');
var join = require('path').join;
var addTimeout = require('../util/addTimeout');
var Check = require('../util/check');
var retry = require('../util/retry');

module.exports = function move (client, readdir) {

  debug('Initialized');

  return function (source, destination, callback) {

    var err = null;
    var entries = [];
    var status = false;
    var check;

    source = normalizePath(source);
    destination = normalizePath(destination);
    callback = addTimeout(callback);

    debug(source, destination);

    retry(callback, function(errHandler){

      // Moving from or to the root directory needs to be handled differently
      if (source === '' || destination === '') {

        readdir(source, function(err, contents){

          entries = contents.map(function(name){
            return {
              from_path: normalizePath(join(source, name)),
              to_path: normalizePath(join(destination, name))
            };
          });

          check = new Check(client, 'filesMoveBatch');

          client.filesMoveBatch({
            allow_shared_folder: true,
            autorename: false,
            allow_ownership_transfer: true,
            entries: entries

          }).then(check(function(res){

            // res.entries may be useful
            
            callback(err, status = true);

          })).catch(errHandler);
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

        }).catch(errHandler);
      } 
    });
  };
};