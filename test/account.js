var dropbox = global.dropbox;

describe("account", function() {

  it("retrieves account information", function(done){
        
    dropbox.account(function(err, account){

      expect(err).toBe(null);
      expect(account).toEqual(jasmine.any(Object));

      done();
    });
  });
});
