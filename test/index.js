var util = require('util');
var child_process = require('child_process');

process.stdin.resume();
process.stdin.setEncoding('utf8');

var Jasmine = require('jasmine');
var jasmine = new Jasmine();
var config = {
  "spec_dir": "test",
  "spec_files": ["*.js"],
  "helpers": [
    "helpers/**/*.js"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": true
};

// Pass in a custom test glob for running only specific tests
if (process.env.TEST) {
  console.log('Running', process.env.TEST);
  config.spec_files = [process.env.TEST];
}

jasmine.loadConfig(config);

var Dropbox = require('../lib');

var token = process.env.DROPBOX_TEST_TOKEN;
var key = process.env.DROPBOX_TEST_KEY;
var secret = process.env.DROPBOX_TEST_SECRET;
var code = process.env.DROPBOX_TEST_CODE;

if (process.argv[2] && process.argv[2].trim() === '-r') {
  return reset();
}

if (!token || !key || !secret || !code) {
  return setup();
}

global.Dropbox = Dropbox;
global.dropbox = Dropbox(token);
global.key = key;
global.secret = secret;

var resetDropboxFolder = require('./resetDropboxFolder');
var resetDataFolder = require('./resetDataFolder');

beforeEach(resetDropboxFolder);
beforeEach(resetDataFolder);

jasmine.execute();

function setup () {

  var command = '';

  ask('Enter the ' + bright('App key') + ' for your Dropbox test app', function(err, key){

    if (err) throw err;
          
    command += 'export DROPBOX_TEST_KEY=' + key;

    ask('Enter the ' + bright('App secret') + ' for your Dropbox test app', function(err, secret){
    
      if (err) throw err;
          
      command += ' && export DROPBOX_TEST_SECRET=' + secret;

      ask('Visit this url:\n' + Dropbox.authenticationUrl(key, secret) + '\n\nClick ' + bright('Allow') + ' then ' + bright('enter the code') + ' you recieve', function(err, code){

        if (err) throw err;
          
        command += ' && export DROPBOX_TEST_CODE=' + code;

        Dropbox.tokenFromCode(key, secret, code, function(err, token){

          if (err) throw err;

          command += ' && export DROPBOX_TEST_TOKEN=' + token;

          console.log();
          console.log(bright('Run this command'), 'to store the environment variables needed to run the tests:');
          console.log(command);
          process.exit();
        });
      });
    });
  });
}

function bright (message) {
  return "\x1b[1m" + message + '\x1b[0m';
}

function reset () {
  
  var vars = ['DROPBOX_TEST_TOKEN', 'DROPBOX_TEST_KEY', 'DROPBOX_TEST_SECRET', 'DROPBOX_TEST_CODE'];
  var command = '';

  for (var i = 0;i < vars.length;i++) {
    if (command) command = command + ' && ';

    command = command + 'unset ' + vars[i];
  }
    
  console.log('Run this command to reset your environment variables for this test suite:');
  console.log();
  console.log(command);
  console.log();
  process.exit();
}

function ask (message, callback) {

  console.log('\n' + message + ':');

  process.stdin.on('data', listen);

  function listen (text) {
    text = text.replace('\n', '');
    process.stdin.removeListener('data', listen);
    callback(null, text);
  }

}