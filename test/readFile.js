var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var debug = require('debug')('dropbox-extra:test:readFile');

describe("readFile", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder(dropbox));

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

});
