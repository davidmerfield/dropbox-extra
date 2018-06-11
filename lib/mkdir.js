var debug = require('debug')('dropbox-extra:mkdir');
var normalizePath = require('../util/normalizePath');
var summary = require('../util/summary');
var isRoot = require('../util/isRoot');
var retry = require('../util/retry');

module.exports = function init (client) {

  return function mkdir (path, callback) {

    var status = false;
    var err = null;

    // Add leading slash if not root directory
    // Remove leadish slash if it is the root
    path = normalizePath(path);
  
    if (isRoot(path))  {
      debug(path, 'is the root directory, it already exists!');
      return callback(err, status);
    }

    retry(callback, function(errHandler){

      client.filesCreateFolder({
          
        // Path in the user's Dropbox to create.
        path: path,

        // If there's a conflict, have the Dropbox server
        // try to autorename the folder to avoid the conflict.
        autorename: false

      }).then(function(res){

        debug('success!');
        debug(res);

        status = true;
        callback(err, status);

      }).catch(errHandler);

    }, function(err){

      if (summary(err) === 'path/conflict/folder') {
        debug('dir already exists');
        err = null;
      } 
      
      callback(err, status);
    });
  };
};


// // We are dealing with single path
//     if (paths) {

//       // Root directory exists by definition
//       // so don't both trying to make it.
//       paths = paths.filter(function(path){
//         return !isRoot(path);
//       });

//       debug('multi paths', paths);

//       // This function will poll Dropbox's endpoint to determine
//       // if the asynchronous job has finished, then invoke the
//       // callback passed to it when it has finished or failed.
//       // For some reason this fails when I pass in the method
//       // client.filesCreateFolderBatchCheck but not when using
//       // the strategy of passing the client, plus the name.
//       wait = waitForJob(client, 'filesCreateFolderBatchCheck');

//       arg = { 

//         // List of paths to be created in the user's
//         // Dropbox. Duplicate path arguments in the 
//         // batch are considered only once.
//         paths: paths,

//         // If there's a conflict, have Dropbox try to
//         // autorename the folder to avoid the conflict.
//         autorename: false
//       };

//       debug('calling dropbox', arg);

//       client.filesCreateFolderBatch(arg).then(wait(function(err, res){

//         debug(err);
//         debug(res);

//         status = true;
//         callback(err, status);

//       })).catch(function(err){

//         debug('HERE', err);

//         debug('Error status:', err.status);
//         debug('Error summary:', err.error.error_summary);

//         callback(err, status);
//       });

//     // We are dealing with single path
//     } else {



  // it("should fail completely for multiple directories if one does not work", function(done) {

  //   dropbox.writeFile('/test', 'Hello world', function(err){

  //     expect(err).toBe(null);

  //     dropbox.mkdir(['/test', '/foo'], function(err, stat){

  //       expect(err !== null);
  //       expect(stat).toBe(false);

  //       dropbox.readdir('/', function(err, contents){

  //         expect(err).toBe(null)
  //         expect(contents).toBe(['test']);
  //         done();
  //       });
  //     });
  //   });

  // });

  // xit("makes multiple directories", function(done) {

  //   dropbox.mkdir(['/test', '/foo'], function(err, status){

  //     expect(err).toBe(null);
  //     expect(status).toBe(true);

  //     dropbox.readdir('/', function(err, contents){

  //       expect(err).toBe(null);
  //       expect(contents).toEqual(['foo', 'test']);
  //       done();
  //     });
  //   });
  // });