/*

need to test for reset err

error:
    { [Error: cannot POST /2/files/list_folder/continue (409)]
      status: 409,
      text: '{"error_summary": "reset/", "error": {".tag": "reset"}}',

*/ 

var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var lib = require('../lib');
var dropbox = lib(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var resetDataFolder = require('./resetDataFolder');
var fs = require('fs-extra');
var timeout = require('./timeout')(jasmine, 60*1000*5); // 5 min
var dataFolder = __dirname + '/data';
var join = require('path').join;
var checkSync = require('./checkSync');

describe("sync", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.

  describe("in root of Dropbox", main('/'));
  describe("in a subfolder of Dropbox", main('/a/b/c'));
  
  function main (dropboxFolder) { return function () {

    beforeEach(resetDropboxFolder);
    beforeEach(resetDataFolder);
      
    // if running the tests inside a subdirectory, ensure it exists
    beforeEach(function(done){

      if (dropboxFolder === '/') return done();
      
      dropbox.emptyDir(dropboxFolder, done);
    });

    beforeEach(timeout.extend);
    afterEach(timeout.reset);
    beforeEach(console.log);
    afterEach(console.log);

    it("removes a local folder which does not exist on dropbox", function(done){

      fs.ensureDirSync(dataFolder + '/foo');

      dropbox.sync(dropboxFolder, dataFolder, function(err, cursor, additions, deletions){

        expect(err).toBe(null);
        expect(cursor).toEqual(jasmine.any(String));
        expect(additions).toEqual([]);
        expect(deletions).toEqual(['/foo']);

        checkSync(dropboxFolder, dataFolder, function(err){

          expect(err).toBe(null);
          done();
        });       
      });
    });


    it("removes a local file which does not exist on dropbox", function(done){

      fs.outputFile(dataFolder + '/foo.txt', 'Hello');

      dropbox.sync(dropboxFolder, dataFolder, function(err, cursor, additions, deletions){

        expect(err).toBe(null);
        expect(cursor).toEqual(jasmine.any(String));
        expect(additions).toEqual([]);
        expect(deletions).toEqual(['/foo.txt']);

        checkSync(dropboxFolder, dataFolder, function(err){

          expect(err).toBe(null);
          done();
        });       
      });
    });


    it("downloads a file from Dropbox", function(done){

      dropbox.writeFile(join(dropboxFolder, 'baz.txt'), 'Hello', function(err){

        expect(err).toBe(null);

        dropbox.sync(dropboxFolder, dataFolder, function(err, cursor, additions, deletions){

          expect(err).toBe(null);
          expect(cursor).toEqual(jasmine.any(String));
          expect(additions).toEqual(['/baz.txt']);
          expect(deletions).toEqual([]);

          checkSync(dropboxFolder, dataFolder, function(err){

            expect(err).toBe(null);
            done();
          });
        });
      });
    });

    it("makes a folder which is on from Dropbox", function(done){

      dropbox.mkdir(join(dropboxFolder, 'hey'), function(err){

        expect(err).toBe(null);

        dropbox.sync(dropboxFolder, dataFolder, function(err, cursor, additions, deletions){

          expect(err).toBe(null);
          expect(cursor).toEqual(jasmine.any(String));
          expect(additions).toEqual(['/hey']);
          expect(deletions).toEqual([]);

          checkSync(dropboxFolder, dataFolder, function(err){

            expect(err).toBe(null);
            done();
          });
        });
      });
    });


    it("updates a file which exists but is stale", function(done){

      fs.outputFileSync(dataFolder + '/test.txt', 'Hey');

      dropbox.writeFile(join(dropboxFolder, 'test.txt'), 'No', function(err){

        expect(err).toBe(null);

        dropbox.sync(dropboxFolder, dataFolder, function(err, cursor, additions, deletions){

          expect(err).toBe(null);
          expect(cursor).toEqual(jasmine.any(String));
          expect(additions).toEqual(['/test.txt']);
          expect(deletions).toEqual([]);
        
          checkSync(dropboxFolder, dataFolder, function(err){

            expect(err).toBe(null);
            done();
          });
        });
      });
    });

    it("replaces a folder with a file", function(done){

      fs.ensureDirSync(dataFolder + '/test.txt');

      dropbox.writeFile(join(dropboxFolder, 'test.txt'), 'No', function(err){

        expect(err).toBe(null);

        dropbox.sync(dropboxFolder, dataFolder, function(err, cursor, additions, deletions){

          expect(err).toBe(null);
          expect(cursor).toEqual(jasmine.any(String));
          expect(additions).toEqual(['/test.txt']);
          expect(deletions).toEqual([]);
        
          checkSync(dropboxFolder, dataFolder, function(err){

            expect(err).toBe(null);
            done();
          });
        });
      });
    });
    
    it("syncs with a cursor", function(done){

      dropbox.writeFile(join(dropboxFolder, 'test.txt'), 'No', function(err){

        expect(err).toBe(null);

        dropbox.sync(dropboxFolder, dataFolder, function(err, cursor, additions, deletions){

          expect(err).toBe(null);
          expect(cursor).toEqual(jasmine.any(String));
          expect(additions).toEqual(['/test.txt']);
          expect(deletions).toEqual([]);

          dropbox.remove(join(dropboxFolder, 'test.txt'), function(err){

            expect(err).toBe(null);

            dropbox.writeFile(join(dropboxFolder, 'another.txt'), 'No', function(err){

              expect(err).toBe(null);
        
              dropbox.sync(dropboxFolder, dataFolder, {cursor: cursor}, function(err, cursor, additions, deletions){

                expect(err).toBe(null);
                expect(cursor).toEqual(jasmine.any(String));
                expect(additions).toEqual(['/another.txt']);
                expect(deletions).toEqual(['/test.txt']);

                checkSync(dropboxFolder, dataFolder, function(err){

                  expect(err).toBe(null);
                  done();
                });
              });
            });
          });
        });
      });
    });

    it("will not redownload a file which matches", function(done){

      dropbox = lib(accessToken);

      dropbox.writeFile(join(dropboxFolder, 'rabbit.txt'), 'hare', function(err){

        expect(err).toBe(null);

        dropbox.sync(dropboxFolder, dataFolder, function(err, firstCursor, additions, deletions){

          expect(err).toBe(null);
          expect(firstCursor).toEqual(jasmine.any(String));
          expect(additions).toEqual(['/rabbit.txt']);
          expect(deletions).toEqual([]);
        
          checkSync(dropboxFolder, dataFolder, function(err){

            expect(err).toBe(null);

            dropbox.sync(dropboxFolder, dataFolder, function(err, secondCursor, additions, deletions){

              expect(err).toBe(null);
              expect(secondCursor).toEqual(jasmine.any(String));
              expect(firstCursor).not.toEqual(secondCursor);
              expect(additions).toEqual([]);
              expect(deletions).toEqual([]);
                            
              checkSync(dropboxFolder, dataFolder, function(err){

                expect(err).toBe(null);

                done();
              });
            });
          });
        });
      });
    });
  };}

  

});
