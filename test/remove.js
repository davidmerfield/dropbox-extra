var debug = require('debug')('emptyDir.test');
var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');

describe("dropbox-extra", function(){

  describe("remove", function() {
  
    // Reset the folder state before running each test
    beforeEach(resetDropboxFolder);


  it("should require a callback function", function(){

    expect(function(){     
      dropbox.remove();
    }).toThrowError(TypeError);

    expect(function(){     
      dropbox.remove('/valid-path.txt');
    }).toThrowError(TypeError);

    expect(function(){     
      dropbox.remove('/valid-path.txt', '123');
    }).toThrowError(TypeError);

  });

  it("should require the path be a string", function() {

    dropbox.remove(true, function(err){
      expect(err instanceof TypeError).toBe(true);
    });

    dropbox.remove(123, function(err){
      expect(err instanceof TypeError).toBe(true);
    });

    dropbox.remove(function(){}, function(err){
      expect(err instanceof TypeError).toBe(true);
    });

    dropbox.remove(null, function(err){
      expect(err instanceof TypeError).toBe(true);
    });
  });

  it("should not error on files or folders that don't exist", function(done) {

    dropbox.remove('/doesnotexist', function(err){

      expect(err).toBe(null);

      dropbox.remove('/does/not/exist.txt', function(err){

        expect(err).toBe(null);
        done();
      });
    });
  });

  it("removes a folder", function(done) {

    dropbox.writeFile('/test/foo.txt', 'Hello', function(err){

      expect(err).toBe(null);

      dropbox.remove('/test', function(err){

        expect(err).toBe(null);

        dropbox.readdir('/', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual([]);
          done();
        });
      });
    });
  });

  it("removes a file", function(done) {

    dropbox.writeFile('/test.txt', 'Hello', function(err){

      expect(err).toBe(null);

      dropbox.remove('/test.txt', function(err){

        expect(err).toBe(null);

        dropbox.readdir('/', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual([]);
          done();
        });
      });
    });
  });

  it("accepts an array of paths", function(done) {

    dropbox.writeFile('/test-2.txt', 'Hello', function(err){

      expect(err).toBe(null);

      dropbox.writeFile('/test-1.txt', 'Hello', function(err){

        expect(err).toBe(null);

        dropbox.remove(['/test-1.txt', '/test-2.txt'], function(err){

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
});
});
