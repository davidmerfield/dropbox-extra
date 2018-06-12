var dropbox = global.dropbox;

describe("revoke", function() {

  it("revokes a token", function(done){
        
    dropbox.revoke(function(err){

      expect(err).toBe(null);

      dropbox.readdir('', function(err){

        expect(err).not.toBe(null);
        done();
      });
    });
  });
});
