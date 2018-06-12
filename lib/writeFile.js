var debug = require('debug')('dropbox-extra:writeFile');
var normalizePath = require('../util/normalizePath');
var retry = require('../util/retry');
var logErr = require('../util/logErr');
var addTimeout = require('../util/addTimeout');

module.exports = function (client) {

  debug('Initialized');

  return function writeFile (path, contents, callback) {

    var err = null;
    var status = false;

    callback = addTimeout(callback);
    path = normalizePath(path);

    debug(path, 'is being written');

    retry(callback, function(errHandler){

      client.filesUpload({

        path: path,
        
        contents: contents,

        mode: {'.tag': 'overwrite'},

        // If there's a conflict, have Dropbox
        // try to autorename the file
        autorename: false, 

        // Mute notifications of changes in the
        // user's Dropbox client software
        mute: false, 

        // List of custom properties to add to file.
        property_groups: [] 

      }).then(function (){

        debug(path, 'back with res');
        callback(err, status = true);

      }).catch(errHandler).catch(logErr);

    }, function(err){

      debug(path, err);

      callback(err, status = false);
    });
  };
};