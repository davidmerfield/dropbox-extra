var debug = require('debug')('dropbox-extra:readFile');
var notString = require('../util/notString');
var notFunction = require('../util/notFunction');
var normalizePath = require('../util/normalizePath');
var validatePath = require('../util/validatePath');
var validateCallback = require('../util/validateCallback');
var Retry = require('../util/retry');

module.exports = function (client) {

  debug('Initialized');

  return function (path, encoding, callback) {

    var result = null, err = null;
    var retry = new Retry();

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

    function onRes (res){

      result = new Buffer(res.fileBinary, 'binary');

      if (encoding) {
        result = result.toString(encoding);
      }

      debug(path, 'has been read', result);
      callback(err, result);

    }

    function onErr (err) {

      debug(path, 'back with err...');

      if (retry.maxed()) {
        debug(path, '.. maxed number of retries so leave now');
        return callback(err, status);
      }

      if (retry.cannot(err)) {
        debug(path, '.. cant retry this error', err);
        return callback(err, status);
      }

      debug(path, '.. waiting to retry...');

      retry.wait(err, function(){

        debug(path, '.. retrying now');

        client.filesDownload(Object.assign({}, arg))
          .then(onRes).catch(onErr);
      });    
    }

    client.filesDownload(Object.assign({}, arg)).then(onRes).catch(onErr);
  };
};