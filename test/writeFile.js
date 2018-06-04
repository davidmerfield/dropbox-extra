var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var debug = require('debug')('dropbox-extra:test:writeFile');
var async = require('async');
describe("writeFile", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder(dropbox));

  it("does not overwrite a folder", function(done) {

    dropbox.mkdir('/test.txt', function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      dropbox.writeFile('/test.txt', 'Foo', function(err, status){

        console.log(err);
        console.log(err.code);

        expect(err === null).toBe(false);
        expect(status).toBe(false);
        done();
      });
    });
  });

  it("writes a file", function(done) {

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

  xit("tolerates mass writes a file", function(done) {

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

    var tasks = [];

    while (tasks.length < 10) {
      tasks.push(write);
    }

    async.parallel(tasks, function(err, results){

      expect(err).toBe(null);
      done();
    });
  });
});
