var debug = require('debug')('move.test');
var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);

describe("dropbox-extra", function(){

  describe("emptyDir", function() {

    var originalTimeout;

    afterEach(function(){
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    });


    // Reset the folder state before running each test
    beforeEach(function (done) {
      debug('resetting folder state');
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;
      dropbox.emptyDir('/', done);
    });


    it("move a file", function(done){

      dropbox.writeFile('/foo.txt', 'foo', function(err){
 
        expect(err).toBe(null);

        dropbox.move('/foo.txt', '/bar.txt', function(err){

          expect(err).toBe(null);
    
          dropbox.readdir('/', function(err, contents){

            expect(err).toBe(null);
            expect(contents).toEqual(['bar.txt']);
            done();
          });
        });
      });
    });

    it("move root contents into subdirectory", function(done){

      debug('writing foo.txt');
      dropbox.writeFile('/foo.txt', 'foo', function(err){
 
        expect(err).toBe(null);

        debug('moving / to /bar');
        dropbox.move('/', '/bar', function(err){

          debug('moved / to /bar');

          expect(err).toBe(null);
    
          dropbox.readdir('/', function(err, contents){

            expect(err).toBe(null);
            expect(contents).toEqual(['bar']);

            dropbox.readdir('/bar', function(err, contents){

              expect(err).toBe(null);
              expect(contents).toEqual(['foo.txt']);

              done();
            });
          });
        });
      });
    });

     it("move subfolder contents into root directory", function(done){

      dropbox.writeFile('/foo/bar.txt', 'foo', function(err){
 
        expect(err).toBe(null);

        debug('moving /foo to /');
        dropbox.move('/foo', '/', function(err){

          expect(err).toBe(null);
    
          dropbox.readdir('/', function(err, contents){

            expect(err).toBe(null);
            expect(contents.sort()).toEqual(['foo', 'bar.txt'].sort());

            dropbox.readdir('/foo', function(err, contents){

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