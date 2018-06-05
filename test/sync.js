var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var resetDataFolder = require('./resetDataFolder');
var fs = require('fs-extra');
var timeout = require('./timeout')(jasmine, 60*1000*5); // 5 min

describe("sync", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder(dropbox));
  beforeEach(resetDataFolder);
  beforeEach(timeout.extend);
  afterEach(timeout.reset);

  xit("syncs a folder", function(done){

    var dataFolder = __dirname + '/data';

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
          
          dropbox.readdir('/', function(err, dropboxItems){

            expect(err).toBe(null);

            fs.readdirSync(dataFolder, function(err, localItems){

              expect(err).toBe(null);
              expect(localItems.sort()).toEqual(dropboxItems.sort);
              done();
            });
          });          
        });
      });
    });
  });

});
