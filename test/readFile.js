var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var async = require('async');
var timeout = require('./timeout')(jasmine);

describe("readFile", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder);
  beforeEach(timeout.extend);
  afterEach(timeout.reset);
  
  it("reads a file", function(done) {

    dropbox.writeFile('/test.txt', 'Foo', function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      dropbox.readFile('/test.txt', 'utf-8', function(err, contents){

        expect(err).toBe(null);
        expect(contents).toEqual('Foo');

        done();
      });
    });
  });

  it("tolerates mass writes a file", function(done) {

    var now = Date.now() + '';

    dropbox.writeFile('/mass.txt', now, function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      var tasks = [];

      function read (cb) {

        dropbox.readFile('/mass.txt', 'utf-8', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual(now);

          cb();
        });
      }

      while (tasks.length < 1000) tasks.push(read);

      async.parallelLimit(tasks, 100, function(err){

        expect(err).toBe(null);
        done();
      });
    });
  });
});
