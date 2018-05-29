var async = require("async");
var debug = require('debug')('remove.test');
var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('./index')(accessToken);

describe("dropbox-extra", function(){

  describe("emptyDir", function() {