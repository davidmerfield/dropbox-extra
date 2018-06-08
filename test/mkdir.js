var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var debug = require('debug')('dropbox-extra:test:mkdir');

describe("mkdir", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder);

  it("makes a directory", function(done) {

    dropbox.mkdir('/test', function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      dropbox.readdir('/', function(err, contents){

        expect(err).toBe(null);
        expect(contents).toEqual(['test']);
        done();
      });
    });
  });


  it("makes a directory inside an non existent directory", function(done) {

    debug('making nested directory');
    
    dropbox.mkdir('/test/foo', function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      dropbox.readdir('/', function(err, contents){

        expect(err).toBe(null);
        expect(contents).toEqual(['test']);

        dropbox.readdir('/test', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual(['foo']);
        
          done();
        });
      });
    });
  });


  it("does not return an error for a directory that exists", function(done) {

    debug('checking for no error on existing directory');

    dropbox.mkdir('/test', function(err, stat){

      expect(err).toBe(null);
      expect(stat).toBe(true);

      dropbox.mkdir('/test', function(err, stat){

        // We should not have modified the user's folder
        // so status should now be false
        expect(err).toBe(null);
        expect(stat).toBe(false);

        done();
      });
    });
  });

  it("does not return an error for the root directory", function(done) {

    debug('checking for no error on root directory');

    dropbox.mkdir('/', function(err, stat){

      expect(err).toBe(null);
      expect(stat).toBe(false);

      done();
    });
  });


  it("does return an error for a file that exists", function(done) {

    debug('checking for error on existing file');

    dropbox.writeFile('/test', 'Hello world', function(err){

      expect(err).toBe(null);

      dropbox.mkdir('/test', function(err, stat){

        expect(err !== null);
        expect(stat).toBe(false);
        done();
      });
    });
  });

});
