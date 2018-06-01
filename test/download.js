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

  it("downloads a file", function(done){

    var contents = 'Hello';
    var output = __dirname + '/data/foo.txt';
    var result;

    dropbox.writeFile('/foo.txt', contents, function(err){

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
