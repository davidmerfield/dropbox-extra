var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var debug = require('debug')('dropbox-extra:test:writeFile');
var async = require('async');
describe("writeFile", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder);

  it("does not overwrite a folder", function(done) {

    dropbox.mkdir('/will-be-directory.txt', function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      dropbox.writeFile('/will-be-directory.txt', 'Foo', function(err, status){

        expect(err === null).toBe(false);
        expect(status).toBe(false);
        done();
      });
    });
  });

  it("writes a file", function(done) {

    dropbox.writeFile('/hello-world.txt', 'Hey', function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      dropbox.readFile('/hello-world.txt', 'utf-8', function(err, contents){

        expect(err).toBe(null);
        expect(contents).toEqual('Hey');

        done();
      });
    });
  });

  it("tolerates mass writes a file", function(done) {

    var tasks = [];

    function write (cb) {

      dropbox.writeFile('/test.txt', 'Foo', function(err, status){

        expect(err).toBe(null);
        expect(status).toBe(true);

        dropbox.readFile('/test.txt', 'utf-8', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual('Foo');

          cb();
        });
      });
    }

    while (tasks.length < 10) tasks.push(write);

    async.parallelLimit(tasks, 10, function(err){

      expect(err).toBe(null);
      done();
    });
  });
});
