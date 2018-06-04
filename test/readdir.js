var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);
var resetDataFolder = require('./resetDataFolder');
var resetDropboxFolder = require('./resetDropboxFolder');
var async = require('async');
var fs = require('fs-extra');

describe("readdir", function() {

  // Ensure the test account's Dropbox folder
  // is empty before running each test.
  beforeEach(resetDropboxFolder(dropbox));
  beforeEach(resetDataFolder);

var originalTimeout;

  afterEach(function(){
    jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
  });


  // Reset the folder state before running each test
  beforeEach(function (done) {
    originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;
  });


  it("reads the root folder", function(done) {

    async.parallel([
      dropbox.writeFile.bind(this, '/1.txt', 'Bar'),
      dropbox.writeFile.bind(this, '/2.txt', 'Baz'),
      dropbox.writeFile.bind(this, '/3.txt', 'Bat'),
    ], function(err, status){

      expect(err).toBe(null);

      dropbox.readdir('/', function(err, contents){

        expect(err).toBe(null);
        expect(contents.sort()).toEqual(['1.txt', '2.txt', '3.txt'].sort());

        done();
      });
    });
  });

  it("reads a huge folder", function(done) {

    var tasks = [], name, contents;

    while (tasks.length < 100) { 
      contents = tasks.length + ' task!';
      name = tasks.length + '.txt';
      fs.outputFileSync(__dirname + '/data/' + name, contents);
      tasks.push(dropbox.writeFile.bind(this, name, contents));
    }

    async.parallelLimit(tasks, 10, function(err, status){

      expect(err).toBe(null);
      expect(status).toEqual(tasks.map(function(){return true;}));

      dropbox.readdir('', function(err, contents){

        expect(err).toBe(null);

        fs.readdir(__dirname + '/data', function(err, localContents){

          expect(err).toBe(null);
          expect(contents.sort()).toEqual(localContents.sort());
          done();
        });
      });
    });
  });
  it("reads a sub folder", function(done) {

    async.parallel([
      dropbox.writeFile.bind(this, '/a/1.txt', 'Bar'),
      dropbox.writeFile.bind(this, '/a/2.txt', 'Baz'),
      dropbox.writeFile.bind(this, '/b/3.txt', 'Bat'),
    ], function(err, status){

      expect(err).toBe(null);

      dropbox.readdir('/a', function(err, contents){

        expect(err).toBe(null);
        expect(contents.sort()).toEqual(['1.txt', '2.txt'].sort());

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
