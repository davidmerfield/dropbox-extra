require('isomorphic-fetch');

var Dropbox = require('dropbox').Dropbox;

module.exports = function (accessToken) {

  var client = new Dropbox({accessToken: accessToken});

  return {
    remove: require('./remove')(client),
    readdir: require('./readdir')(client),
    writeFile: require('./writeFile')(client),
  };
};