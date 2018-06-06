var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var resetDataFolder = require('./resetDataFolder');
var fs = require('fs-extra');
var timeout = require('./timeout')(jasmine, 60*1000*5); // 5 min
var join = require('path').join;
var dataFolder = __dirname + '/data';
var async = require('async');

function arraysEqual (arr1, arr2) {

    // sort the arrays
    arr1.sort();
    arr2.sort();

    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}

var debug = require('debug')('sync');

function checkReaddirInFolders (dbRoot, fsRoot, callback) {

  debug('db reading', dbRoot);

  dropbox.readdir(dbRoot, function(dbErr, dbContents){

    debug('fs reading', dbRoot);
  
    fs.readdir(fsRoot, function(fsErr, fsContents){

      debug('fs err', fsErr);
      debug('db err', dbErr);

      debug('fs Contents', fsContents);
      debug('db Contents', dbContents);
      
      if (fsErr || dbErr) return callback(fsErr || dbErr);

      if (!arraysEqual(dbContents, fsContents)) {
        return callback(new Error('Contents are not equal'));
      }

      async.eachOf(dbContents, function(name, index, next){

        fs.stat(join(fsRoot, name), function(fsErr, fsStat){

          dropbox.stat(join(dbRoot, name), function(dbErr, dbStat){

            if (fsErr || dbErr) return callback(fsErr || dbErr);

            if (fsStat.isDirectory() !== dbStat.isDirectory()) {
              return callback(new Error(join(fsRoot, name) + ' isDirectory does not match'));
            }
            
            if (fsStat.isFile() !== dbStat.isFile()) {
              return callback(new Error(join(fsRoot, name) + ' isFile does not match'));
            }

            if (dbStat.isDirectory()) {
              return checkReaddirInFolders(join(dbRoot, name), join(fsRoot, name), next);              
            }

            if (fsStat.size !== dbStat.size) {
              return callback(new Error(join(fsRoot, name) + ' Size does not match'));
            }

            if (fsStat.mtime.valueOf() !== dbStat.mtime.valueOf()) {
              return callback(new Error(join(fsRoot, name) + ' mtime does not match'));
            }

            next(null);
          });
        });
      }, callback);
    });
  });
}

describe("sync", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder(dropbox));
  beforeEach(resetDataFolder);
  beforeEach(timeout.extend);
  afterEach(timeout.reset);

  it("syncs a file", function(done){

    dropbox.writeFile('/foo/bar/baz.txt', 'Hello', function(err){

      expect(err).toBe(null);

      dropbox.sync('/', dataFolder, function(err){

        expect(err).toBe(null);

        checkReaddirInFolders('/', dataFolder, function(err){

          expect(err).toBe(null);
          done();
        });
      });
    });

  });

  /*
  
  need to test for reset err

error:
      { [Error: cannot POST /2/files/list_folder/continue (409)]
        status: 409,
        text: '{"error_summary": "reset/", "error": {".tag": "reset"}}',

  */ 


  it("syncs a folder", function(done){

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
          
          checkReaddirInFolders('/', dataFolder, function(err){

            expect(err).toBe(null);
            done();
          });       
        });
      });
    });
  });

});
