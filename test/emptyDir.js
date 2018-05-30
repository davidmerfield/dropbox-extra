var debug = require('debug')('emptyDir.test');
var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');

describe("emptyDir", function() {

  // Reset the folder state before running each test
  beforeEach(resetDropboxFolder(dropbox));

  it("requires a callback function", function(){

    // Invalid callback function parameters
    [null, 123, '', undefined, {}, []].forEach(function(callback){

      expect(function(){     
        dropbox.emptyDir('', callback);
      }).toThrowError(TypeError);

    });
  });


  it("requires path as a string", function(){

    // Invalid path parameters
    [null, 123, function(){}, undefined, {}, []].forEach(function(path){

      dropbox.emptyDir(path, function(err){

        expect(err instanceof TypeError).toBe(true);
      });
    });
  });


  it("should empty a sub directory", function(done){

    dropbox.writeFile('/foo/test.txt', 'foo', function(err){

      expect(err).toBe(null);

      dropbox.emptyDir('/foo', function(err){

        expect(err).toBe(null);
  
        dropbox.readdir('/foo', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual([]);

          done();
        });
      });
    });
  });

  it("should replace a file with an empty directory", function(done){

    dropbox.writeFile('/test.txt', 'Hello', function(err){

      expect(err).toBe(null);

      dropbox.emptyDir('/test.txt', function(err){

        expect(err).toBe(null);
  
        dropbox.readdir('/test.txt', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual([]);

          done();
        });
      });
    });
  });

  it("should create a new empty directory", function(done){

    dropbox.emptyDir('/foo', function(err){

      expect(err).toBe(null);

      dropbox.readdir('/', function(err, contents){

        expect(err).toBe(null);
        expect(contents).toEqual(['foo']);

        done();
      });
    });
  });


  it("should empty the root directory", function(done){

    dropbox.writeFile('/foo/test.txt', 'foo', function(err){

      expect(err).toBe(null);

      dropbox.emptyDir('/', function(err){

        expect(err).toBe(null);
  
        dropbox.readdir('/', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual([]);

          done();
        });
      });
    });
  });

});
