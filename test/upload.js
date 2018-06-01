var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDropboxFolder = require('./resetDropboxFolder');
var resetDataFolder = require('./resetDataFolder');
var fs = require('fs-extra');

describe("download", function() {

    // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder(dropbox));
  beforeEach(resetDataFolder);

  it("uploads a file", function(done){

    var contents = 'Hello';
    var output = __dirname + '/data/foo.txt';
    var result;

    fs.writeFileSync(output, contents);

    dropbox.upload(output, '/foo.txt', function(err){

      expect(err).toBe(null);
    
      dropbox.download('/foo.txt', output, function(err){
  
        expect(err).toBe(null);
        result = fs.readFileSync(output, 'utf-8');
        expect(result).toEqual(contents);
        done();
      });
    });
  });
});


resetDropboxFolder(dropbox)(function(err){

  if (err) throw err;

  var testDirectory = __dirname + '/data';
  var testFilePath = testDirectory + '/test.txt';
  var testFilePathResult = testDirectory + '/test-result.txt';

  var testContents = Date.now() + '';
  
  var dropboxPath = '/test.txt';

  fs.emptyDirSync(testDirectory);
  fs.writeFileSync(testFilePath, testContents);

  debug('Reset folder');

  dropbox.upload(testFilePath, dropboxPath, function(err){

    if (err) throw err;
  
    debug('Wrote files');
  
    dropbox.download(dropboxPath, testFilePathResult, function(err){
      
      if (err) throw err;
  
      debug('Downloaded?');
    });
  });
});
