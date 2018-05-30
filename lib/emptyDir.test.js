var debug = require('debug')('emptyDir.test');
var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('./index')(accessToken);

describe("dropbox-extra", function(){

  describe("emptyDir", function() {

    // Reset the folder state before running each test
    beforeEach(function (done) {
 
      debug('resetting folder state');

      dropbox.emptyDir('/', function(err){

        if (err) throw err;
         
        debug('reset folder state successfully!');
       done();
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
});