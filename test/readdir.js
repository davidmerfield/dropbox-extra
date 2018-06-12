var dropbox = global.dropbox;
var async = require('async');
var fs = require('fs-extra');

describe("readdir", function() {

  it("reads the root folder", function(done) {

    async.parallel([
      dropbox.writeFile.bind(this, '/1.txt', 'Bar'),
      dropbox.writeFile.bind(this, '/2.txt', 'Baz'),
      dropbox.writeFile.bind(this, '/3.txt', 'Bat'),
    ], function(err){

      expect(err).toBe(null);

      dropbox.readdir('/', function(err, contents){

        expect(err).toBe(null);
        expect(!!contents).toBe(true);
        
        if (contents) expect(contents.sort()).toEqual(['1.txt', '2.txt', '3.txt'].sort());

        done();
      });
    });
  });

  xit("reads a huge folder", function(done) {

    var tasks = [], name, contents;

    while (tasks.length < 1000) { 
      contents = tasks.length + ' task!';
      name = '/foo/' + tasks.length + '.txt';
      fs.outputFileSync(__dirname + '/data/' + name, contents);
      tasks.push(dropbox.writeFile.bind(this, name, contents));
    }

    async.parallelLimit(tasks, 10, function(err, status){

      console.log('Done this!');

      expect(err).toBe(null);
      expect(status).toEqual(tasks.map(function(){return true;}));

      dropbox.readdir('/foo', function(err, contents){

        expect(err).toBe(null);
        console.log('Done this too!');

        fs.readdir(__dirname + '/data/foo', function(err, localContents){


          console.log('CONTENTS', contents.sort());
          console.log('Local CONTENTS', localContents.sort());

          expect(err).toBe(null);
          expect(contents.sort()).toEqual(localContents.sort());


          done();
        });
      });
    });
  }, 60*1000*5);
  
  it("reads a sub folder", function(done) {

    dropbox.writeFile('/a/1.txt', 'foo', function(err){
      
      expect(err).toBe(null);

      dropbox.readdir('/a', function(err, contents){

        expect(err).toBe(null);
        expect(contents === undefined).toBe(false);
        
        if (contents) expect(contents.sort()).toEqual(['1.txt'].sort());

        done();
      });
    });
  });

  it("reads an empty folder", function(done) {

    dropbox.readdir('/', function(err, contents){

      expect(err).toBe(null);
      expect(contents).toEqual([]);

      done();
    });
  });
});
