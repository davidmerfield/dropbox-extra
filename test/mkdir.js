var async = require("async");
var debug = require('debug')('mkdir.test');
var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('./index')(accessToken);

describe("dropbox-extra", function(){

  describe("mkdir", function() {

    // Reset the folder state before running each test
    beforeEach(function (done) {
      debug('resetting folder state');
      dropbox.emptyDir('/', done);
    });


    it("makes a directory", function(done) {


      debug('making directory');

      dropbox.mkdir('/test', function(err){

        expect(err).toBe(null);

        dropbox.readdir('/', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual(['test']);

          dropbox.readdir('/test', function(err, contents){

            expect(err).toBe(null);
            expect(contents).toEqual([]);
          
            done();
          });
        });
      });
    });


    it("makes a directory inside an non existent directory", function(done) {

      debug('making nested directory');
      
      dropbox.mkdir('/test/foo', function(err){

        expect(err).toBe(null);

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
});
