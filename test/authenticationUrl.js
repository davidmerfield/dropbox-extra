var Dropbox = global.Dropbox;

describe("authenticationUrl", function() {

  it("returns a url", function(done){
      
    expect(Dropbox.authenticationUrl(global.key, global.secret)).toEqual(jasmine.any(String));
    done();
  });
});
