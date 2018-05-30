// Dropbox now depends on this as a global function
// so we require it here now... See more about this
// https://github.com/dropbox/dropbox-sdk-js/issues/200
require('isomorphic-fetch');

// The Offical Dropbox SDK
var Dropbox = require('dropbox').Dropbox;

// Load the code for the methods we'll expose
var readdir = require('./readdir');
var remove = require('./remove');
var mkdir = require('./mkdir');
var writeFile = require('./writeFile');
var emptyDir = require('./emptyDir');
var move = require('./move');

// This function
module.exports = function (accessToken) {

  var API = {};

  // This is the core Dropbox client which we wrap
  // to extend its functionality and adjust its
  var client = new Dropbox({accessToken: accessToken});

  // These methods need the core Dropbox client to work
  API.readdir = new readdir(client);
  API.remove = new remove(client);
  API.mkdir = new mkdir(client);
  API.writeFile = new writeFile(client);
  
  // These functions depend on simpler sub functions
  API.move = new move(client, API.readdir);
  API.emptyDir = new emptyDir(API.readdir, API.remove, API.mkdir);

  return API;
};