var dropbox = global.dropbox;
var async = require('async');

describe("writeFile", function() {

  it("does not overwrite a folder", function(done) {

    dropbox.mkdir('/will-be-directory.txt', function(err, status){

      expect(err).toBe(null);
      expect(status).toEqual(jasmine.any(Object));
      expect(status.id).toEqual(jasmine.any(String));
      expect(status.path_display).toEqual(jasmine.any(String));

      dropbox.writeFile('/will-be-directory.txt', 'Foo', function(err, status){

        expect(err === null).toBe(false);
        expect(status).toBe(false);
        done();
      });
    });
  });

  it("writes a file", function(done) {

    dropbox.writeFile('/hello-world.txt', 'Hey', function(err, status){

      expect(err).toBe(null);
      expect(status).toBe(true);

      dropbox.readFile('/hello-world.txt', 'utf-8', function(err, contents){

        expect(err).toBe(null);
        expect(contents).toEqual('Hey');

        done();
      });
    });
  });

  it("tolerates mass writes a file", function(done) {

    var tasks = [];

    function write (cb) {

      dropbox.writeFile('/test.txt', 'Foo', function(err, status){

        expect(err).toBe(null);
        expect(status).toBe(true);

        dropbox.readFile('/test.txt', 'utf-8', function(err, contents){

          expect(err).toBe(null);
          expect(contents).toEqual('Foo');

          cb();
        });
      });
    }

    while (tasks.length < 10) tasks.push(write);

    async.parallelLimit(tasks, 10, function(err){

      expect(err).toBe(null);
      done();
    });
  });
});
