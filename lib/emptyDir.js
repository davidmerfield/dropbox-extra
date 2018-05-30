var debug = require('debug')('remove');
var normalizePath = require('./normalizePath');
var async = require('async');

module.exports = function (client) {

  debug('Initialized');

  return function (path, callback) {

    if (typeof callback !== 'function') {
      throw new TypeError('Pass a callback to dropbox-extra.remove');
    }

    if (typeof path !== 'string') {
      return callback(new TypeError('Pass a string to dropbox-extra.remove'));
    }

    var status = false;

    var remove = require('./remove')(client);
    var mkdir = require('./mkdir')(client);
    var readdir = require('./readdir')(client);

    path = normalizePath(path);
    debug(path);

    // Emptying the root directory
    if (path === '') {

      readdir('/', function(err, contents){

        async.forEachOf(contents, function(item, key, next){

        debug('removing', item);
        remove(item, next);

        }, function(err){

          callback(err, status);
        });   
      });

    // Something other than the root directory
    } else {

      remove(path, function(err){

        if (err) return callback(err, status);

        mkdir(path, function(err){

          if (err) return callback(err, status);

          status = true;
          callback(err, status);
        }); 
      });   
    } 
  };
};