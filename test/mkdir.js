var dropbox = global.dropbox;

describe("mkdir", function() {

  it("makes a directory", function(done) {

    dropbox.mkdir('/test', function(err, status){

      expect(err).toBe(null);
      expect(status).toEqual(jasmine.any(Object));
      expect(status.id).toEqual(jasmine.any(String));
      expect(status.path_display).toEqual(jasmine.any(String));

      dropbox.readdir('/', function(err, contents){

        expect(err).toBe(null);
        expect(contents).toEqual(['test']);
        done();
      });
    });
  });

  it("makes a directory inside an non existent directory", function(done) {
    
    dropbox.mkdir('/test/foo', function(err, status){

      expect(err).toBe(null);
      expect(status).toEqual(jasmine.any(Object));
      expect(status.id).toEqual(jasmine.any(String));
      expect(status.path_display).toEqual(jasmine.any(String));

      dropbox.readdir('/', function(err, contents){

        expect(err).toBe(null);
        expect(contents).toEqual(['test']);

        dropbox.readdir('/test', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual(['foo']);
        
          done();
        });
      });
    });
  });

  it("does not return an error for a directory that exists", function(done) {

    dropbox.mkdir('/test', function(err, status){

      expect(err).toBe(null);
      expect(status).toEqual(jasmine.any(Object));
      expect(status.id).toEqual(jasmine.any(String));
      expect(status.path_display).toEqual(jasmine.any(String));
      
      dropbox.mkdir('/test', function(err, stat){

        // We should not have modified the user's folder
        // so status should now be false
        expect(err).toBe(null);
        expect(stat).toBe(false);

        done();
      });
    });
  });

  it("does not return an error for the root directory", function(done) {

    dropbox.mkdir('/', function(err, stat){

      expect(err).toBe(null);
      expect(stat).toBe(false);

      done();
    });
  });


  it("does return an error for a file that exists", function(done) {

    dropbox.writeFile('/test', 'Hello world', function(err){

      expect(err).toBe(null);

      dropbox.mkdir('/test', function(err, stat){

        expect(err !== null);
        expect(stat).toBe(false);
        done();
      });
    });
  });

});
