var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');

describe("emptyDir", function() {


  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder(dropbox));


  // Do some basic check of the callback argument
  it("requires a callback function", function(){

    var invalidCallbacks = [null, undefined, 123, '', {}, []];
    var validPath = '/test.txt';

    invalidCallbacks.forEach(function(invalidCallback){

      expect(function(){     

        dropbox.emptyDir(validPath, invalidCallback);

      }).toThrowError(TypeError);
    });
  });


  // Do a basic check of the path. Assuming
  // the callback is a valid function, it will
  // pass the error there instead of throwing.
  it("requires path as a string", function(){

    // Invalid path parameters
    var invalidPaths = [null, 123, function(){}, undefined, {}, []];
    var validCallback = function(){};
    
    invalidPaths.forEach(function(invalidPath){

      expect(function(){     

        dropbox.emptyDir(invalidPath, validCallback);

      }).toThrowError(TypeError);
    });
  });


  // Now we test the methods actual behaviour
  it("empties a directory", function(done){

    // First we write a file to a subdirectory to ensure
    // there is actually something to empty!
    dropbox.writeFile('/foo/test.txt', 'foo', function(err){

      expect(err).toBe(null);

      // Now we attempt to empty the directory
      dropbox.emptyDir('/foo', function(err, status){

        // Status should be true because we ought to have
        // modified the user's folder with the last call
        expect(err).toBe(null);
        expect(status).toBe(true);

        // Verify that the directory exists and is empty
        dropbox.readdir('/foo', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual([]);

          done();
        });
      });
    });
  });


  // Ensure that emptyDir creates directories
  // that don't exist, even if the directory is
  // itself inside a directory that doesn't exist
  it("creates a directory if none exists", function(done){

    // Neither foo nor foo/bar exist since the folder
    // has been reset to empty.
    dropbox.emptyDir('/foo/bar', function(err, status){

      // We should have modified the folder
      // so status should be true
      expect(err).toBe(null);
      expect(status).toBe(true);

      // Now we verify that emptyDir creates the 
      // directory, its parents, and that it is empty
      dropbox.readdir('/', function(err, contents){

        expect(err).toBe(null);
        expect(contents).toEqual(['foo']);

        dropbox.readdir('/foo', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual(['bar']);

          dropbox.readdir('/foo/bar', function(err, contents){

            expect(err).toBe(null);
            expect(contents).toEqual([]);

            done();
          });
        });
      });
    });
  });

  // Dropbox treats the root directory slightly
  // differently in lots of ways. It won't let you
  // call filesDelete on it, for instance, if you
  // want to empty it of any contents. 
  it("empties the root directory", function(done){

    // We write some file to the folder to test if 
    // it is removed by emptyDir
    dropbox.writeFile('/foo/test.txt', 'foo', function(err){

      expect(err).toBe(null);

      dropbox.emptyDir('/', function(err, status){

        // Status should be true because we ought to have
        // modified the user's folder with the last call
        expect(err).toBe(null);
        expect(status).toBe(true);
    
        // Verify that there is nothing inside the user's
        // Dropbox folder now that emptyDir has been called.
        dropbox.readdir('/', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual([]);

          done();
        });
      });
    });
  });


  it("replaces an existing file with an empty directory", function(done){

    dropbox.writeFile('/test.txt', 'Hello', function(err){

      expect(err).toBe(null);

      dropbox.emptyDir('/test.txt', function(err, status){

        expect(err).toBe(null);
        expect(status).toBe(true);
  
        dropbox.readdir('/test.txt', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual([]);

          done();
        });
      });
    });
  });

});
