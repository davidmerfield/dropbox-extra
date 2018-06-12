var dropbox = global.dropbox;

describe("move", function() {

  it("moves a file", function(done){

    dropbox.writeFile('/foo.txt', 'foo', function(err){

      expect(err).toBe(null);

      dropbox.move('/foo.txt', '/bar.txt', function(err){

        expect(err).toBe(null);
  
        dropbox.readdir('/', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual(['bar.txt']);
          done();
        });
      });
    });
  }, 20000);

  it("move root contents into subdirectory", function(done){

    dropbox.writeFile('/foo.txt', 'foo', function(err){

      expect(err).toBe(null);

      dropbox.move('/', '/bar', function(err){

        expect(err).toBe(null);
  
        dropbox.readdir('/', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual(['bar']);

          dropbox.readdir('/bar', function(err, contents){

            expect(err).toBe(null);
            expect(contents).toEqual(['foo.txt']);

            done();
          });
        });
      });
    });
  }, 25000);


  it("move subfolder contents into root directory", function(done){

    dropbox.writeFile('/foo/bar.txt', 'foo', function(err){

      expect(err).toBe(null);

      dropbox.move('/foo', '/', function(err){

        expect(err).toBe(null);

        dropbox.readdir('/', function(err, contents){

          expect(err).toBe(null);
          expect(contents.sort()).toEqual(['foo', 'bar.txt'].sort());

          dropbox.readdir('/foo', function(err, contents){

            expect(err).toBe(null);
            expect(contents).toEqual([]);

            done();
          });
        });
      });
    });
  }, 20000);

});