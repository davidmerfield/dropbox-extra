var async = require("async");
var debug = require('debug')('remove.test');
var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('./index')(accessToken);

describe("dropbox-extra", function(){

  describe("remove", function() {

  // Reset the folder state before running each test
  beforeEach(function (done) {

    debug('resetting folder state');

    dropbox.readdir('/', function(err, contents){

      if (err) throw err;
        
      async.forEachOf(contents, function(item, key, next){

        debug('removing', item);
        dropbox.remove(item, next);

      }, function(err){

        if (err) throw err;

        debug('reset folder state successfully!');
        done();
      });      
    });
  });

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
      expect(err).toEqual(new TypeError('Pass a string to dropbox-extra.remove'));
    });

    dropbox.remove(123, function(err){
      expect(err).toEqual(new TypeError('Pass a string to dropbox-extra.remove'));
    });

    dropbox.remove(function(){}, function(err){
      expect(err).toEqual(new TypeError('Pass a string to dropbox-extra.remove'));
    });

    dropbox.remove(null, function(err){
      expect(err).toEqual(new TypeError('Pass a string to dropbox-extra.remove'));
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
});
});
