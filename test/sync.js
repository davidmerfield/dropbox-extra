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
  beforeEach(resetDropboxFolder);
  beforeEach(resetDataFolder);
  beforeEach(timeout.extend);
  afterEach(timeout.reset);
  beforeEach(console.log);
  afterEach(console.log);

  xit("removes a local folder which does not exist on dropbox", function(done){

    fs.ensureDirSync(dataFolder + '/foo');

    dropbox.sync('/', dataFolder, function(err){

      expect(err).toBe(null);

      checkSync('/', dataFolder, function(err){

        expect(err).toBe(null);
        done();
      });       
    });
  });


  xit("removes a local file which does not exist on dropbox", function(done){

    fs.outputFile(dataFolder + '/foo.txt', 'Hello');

    dropbox.sync('/', dataFolder, function(err){

      expect(err).toBe(null);

      checkSync('/', dataFolder, function(err){

        expect(err).toBe(null);
        done();
      });       
    });
  });


  xit("downloads a file from Dropbox", function(done){

    dropbox.writeFile('/baz.txt', 'Hello', function(err){

      expect(err).toBe(null);

      dropbox.sync('/', dataFolder, function(err){

        expect(err).toBe(null);

        checkSync('/', dataFolder, function(err){

          expect(err).toBe(null);
          done();
        });
      });
    });
  });

  xit("makes a folder which is on from Dropbox", function(done){

    dropbox.mkdir('/hey', function(err){

      expect(err).toBe(null);

      dropbox.sync('/', dataFolder, function(err){

        expect(err).toBe(null);

        checkSync('/', dataFolder, function(err){

          expect(err).toBe(null);
          done();
        });
      });
    });
  });


  xit("updates a file which exists but is stale", function(done){

    fs.outputFileSync(dataFolder + '/test.txt', 'Hey');

    dropbox.writeFile('/test.txt', 'No', function(err){

      expect(err).toBe(null);

      dropbox.sync('/', dataFolder, function(err){

        expect(err).toBe(null);

        checkSync('/', dataFolder, function(err){

          expect(err).toBe(null);
          done();
        });
      });
    });
  });

  xit("replaces a folder with a file", function(done){

    fs.ensureDirSync(dataFolder + '/test.txt');

    dropbox.writeFile('/test.txt', 'No', function(err){

      expect(err).toBe(null);

      dropbox.sync('/', dataFolder, function(err){

        expect(err).toBe(null);

        checkSync('/', dataFolder, function(err){

          expect(err).toBe(null);
          done();
        });
      });
    });
  });
  
  it("will not redownload a file which matches", function(done){

    fs.writeFileSync(dataFolder + '/rabbit.txt', 'hare');
  
    dropbox = lib(accessToken);
    spyOn(dropbox, 'download');

    dropbox.writeFile('/rabbit.txt', 'hare', function(err){

      expect(err).toBe(null);

      dropbox.sync('/', dataFolder, function(err){

        expect(err).toBe(null);

        console.log('Checking sync!');

        checkSync('/', dataFolder, function(err){

          console.log('Back here sync!');

          expect(err).toBe(null);
          expect(dropbox.download).toHaveBeenCalled();

          console.log('Calling done!');
          done();
        });
      });
    });
  });


  xit("syncs a folder", function(done){

    var localFileWhichShouldLeavePath = dataFolder + '/foo/bar.txt';
    var localFileWhichShouldLeaveContents = 'Hey there';

    var dropboxFilePath = '/baz/bar.txt';
    var dropboxFileContents = 'Hello';

    fs.outputFile(localFileWhichShouldLeavePath, localFileWhichShouldLeaveContents, function(err){

      expect(err).toBe(null);

      dropbox.writeFile(dropboxFilePath, dropboxFileContents, function(err){

        expect(err).toBe(null);

        dropbox.sync('/', dataFolder, function(err){

          expect(err).toBe(null);
          
          checkSync('/', dataFolder, function(err){

            expect(err).toBe(null);
            done();
          });       
        });
      });
    });
  });

});
