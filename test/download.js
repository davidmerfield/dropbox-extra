var dropbox = global.dropbox;
var fs = require('fs-extra');

describe("download", function() {

  it("downloads a file", function(done){

    var output = __dirname + '/data/foo.txt';

    dropbox.writeFile('/foo.txt', 'Hello', function(err){

      expect(err).toBe(null);
    
      dropbox.download('/foo.txt', output, function(err){
  
        expect(err).toBe(null);
        expect(fs.readFileSync(output, 'utf-8')).toEqual('Hello');
        
        done();
      });
    });
  });
});
