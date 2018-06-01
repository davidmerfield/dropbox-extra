var debug = require('debug')('readFile');
var notString = require('../util/notString');
var notFunction = require('../util/notFunction');
var normalizePath = require('../util/normalizePath');
var validatePath = require('../util/validatePath');
var validateCallback = require('../util/validateCallback');

module.exports = function (client) {

  debug('Initialized');

  return function (path, encoding, callback) {

    var result, err = null;

    if (notFunction(callback) && notString(encoding)) {
      encoding = null;
      callback = encoding;
    }

    validateCallback(callback);
    validatePath(path);

    path = normalizePath(path);
    debug(path);

    var arg = {
      path: path
    };

    client.filesDownload(arg).then(function(res){

      result = new Buffer(res.fileBinary, 'binary');

      if (encoding) result = result.toString(encoding);

      callback(err, result);

    }).catch(function(err){

      debug(err);
      callback(err);
    });
  };
};