var debug = require('debug')('dropbox-extra:writeFile');
var normalizePath = require('../util/normalizePath');
var Retry = require('../util/retry');
var logErr = require('../util/logErr');

module.exports = function (client) {

  debug('Initialized');

function generateUID() {
    // I generate the UID from two parts here 
    // to ensure the random number provide enough bits.
    var firstPart = (Math.random() * 46656) | 0;
    var secondPart = (Math.random() * 46656) | 0;
    firstPart = ("000" + firstPart.toString(36)).slice(-3);
    secondPart = ("000" + secondPart.toString(36)).slice(-3);
    return firstPart + secondPart;
}

  return function writeFile (path, contents, callback) {

    var UID = generateUID();
    var arg;
    var err = null;
    var status = false;
    var retry = new Retry();

    path = normalizePath(path);
    debug(UID, path, 'is being written');

    arg = {
      path: path,
      contents: contents,
      mode: {'.tag': 'overwrite'},
      autorename: false, // If there's a conflict, have Dropbox try to autorename the file
      mute: false, // Mute notifications of changes in the user's Dropbox client software
      property_groups: [] // List of custom properties to add to file.
    };

    function onRes (res){

      debug(UID, path, 'back with res');
      status = true;
      callback(err, status);

    }

    function onErr (err){

      debug(UID, path, 'back with err...');

      if (retry.maxed()) {
        debug(UID, path, '.. maxed number of retries so leave now');
        return callback(err, status);
      }

      if (retry.cannot(err)) {
        debug(UID, path, '.. cant retry this error', err);
        return callback(err, status);
      }

      debug(UID, path, '.. waiting to retry...');

      retry.wait(err, function(){

        debug(UID, path, '.. retrying now');

        client.filesUpload(Object.assign({}, arg))
          .then(onRes).catch(onErr).catch(logErr);
      });
    }

    client.filesUpload(Object.assign({}, arg))
      .then(onRes).catch(onErr).catch(logErr);
  };
};