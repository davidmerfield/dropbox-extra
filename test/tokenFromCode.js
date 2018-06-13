var Dropbox = global.Dropbox;

describe("tokenFromCode", function() {

  it("returns a token", function(done){
    
    Dropbox.tokenFromCode(global.key, global.secret, global.code, function(err, token){

      expect(err).toBe(null);
      expect(token).toEqual(jasmine.any(String));

      var dropbox = new Dropbox(token);

      dropbox.readdir('', function(err){
    
        expect(err).toBe(null);  
        done();
      });
    });    
  });
});
