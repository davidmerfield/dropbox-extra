var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var resetDataFolder = require('./resetDataFolder');
var fs = require('fs');

describe("stat", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder);
  beforeEach(resetDataFolder);

  it("returns an error for a path to nothing", function(done) {

    dropbox.stat('/nemo', function(err, stat){

      expect(stat).toBe(null);
      expect(err).not.toBe(null);
      expect(err.code).toBe('ENOENT');
      done(); 
    });
  });

  it("gets a folder's stat", function(done) {

    dropbox.mkdir('/another', function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      dropbox.stat('/another', function(err, stat){

        expect(err).toBe(null);
        expect(stat.isDirectory()).toBe(true);
        expect(stat.isFile()).toBe(false);
        expect(stat.name).toBe('another');
        
        done(); 
      });
    });
  });

  it("gets a file's stat", function(done) {

    dropbox.writeFile('/test.txt', 'Foo', function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      dropbox.download('/test.txt', __dirname + '/data/test.txt', function(err){

        expect(err).toBe(null);

        dropbox.stat('/test.txt', function(err, dbstat){

          expect(err).toBe(null);
    
          fs.stat(__dirname + '/data/test.txt', function(err, fsstat){

            expect(err).toBe(null);
            expect(fsstat.isDirectory()).toEqual(dbstat.isDirectory());
            expect(fsstat.isFile()).toEqual(dbstat.isFile());
            expect(fsstat.mtime).toEqual(dbstat.mtime);
            expect(fsstat.size).toEqual(dbstat.size);
            done();
          });
        });
      });
    });
  });

});
