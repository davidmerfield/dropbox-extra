var debug = require('debug')('dropbox-extra:readFile');
var notString = require('../util/notString');
var notFunction = require('../util/notFunction');
var normalizePath = require('../util/normalizePath');
var retry = require('../util/retry');
var addTimeout = require('../util/addTimeout');
var logErr = require('../util/logErr');

module.exports = function (client) {

  debug('Initialized');

  return function (path, encoding, callback) {

    var result = null;
    var err = null;


    if (notFunction(callback) && notString(encoding)) {
      encoding = null;
      callback = encoding;
    }

    callback = addTimeout(callback);
    path = normalizePath(path);

    debug(path);

    retry(callback, function(errHandler){

      client.filesDownload({
        path: path
      }).then(function (res){

        result = new Buffer(res.fileBinary, 'binary');

        if (encoding) {
          result = result.toString(encoding);
        }

        debug(path, 'has been read', result);
        callback(err, result);

      }).catch(errHandler).catch(logErr);

    }, function(err){

      debug(path, err);
      callback(err, result);
    });
  };
};