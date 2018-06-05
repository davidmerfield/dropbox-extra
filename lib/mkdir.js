var debug = require('debug')('dropbox-extra:mkdir');
var normalizePath = require('../util/normalizePath');
var validatePath = require('../util/validatePath');
var validateCallback = require('../util/validateCallback');
var isRoot = require('../util/isRoot');
var Retry = require('../util/retry');

module.exports = function init (client) {

  return function mkdir (path, callback) {

    var arg;
    var status = false;
    var err = null;
    var retry = new Retry();

    validateCallback(callback);
    validatePath(path);
        
    // Add leading slash if not root directory
    // Remove leadish slash if it is the root
    path = normalizePath(path);
  
    if (isRoot(path))  {
      debug(path, 'is the root directory, it already exists!');
      return callback(err, status);
    }

    arg = {
        
      // Path in the user's Dropbox to create.
      path: path,

      // If there's a conflict, have the Dropbox server
      // try to autorename the folder to avoid the conflict.
      autorename: false
    };

    function onRes (res){

      debug('success!');
      debug(res);

      status = true;
      callback(err, status);
    }    

    function onErr (err){

      if (folderExists(err)) {
        debug('dir already exists');
        err = null;
        return callback(err, status);
      } 

      if (retry.maxed()) {
        debug(path, '.. maxed number of retries so leave now');
        return callback(err, status);
      }

      if (retry.cannot(err)) {
        debug(path, '.. cant retry this error', err);
        return callback(err, status);
      }

      debug(path, '.. waiting to retry...');

      retry.wait(err, function(){

        debug(path, '.. retrying now');

        client.filesDownload(Object.assign({}, arg))
          .then(onRes).catch(onErr);
      });
    }    

    client.filesCreateFolder(arg).then(onRes).catch(onErr);
  };
};

function folderExists (err) {
 
  return err &&
         err.error && 
         err.error.error_summary &&
         err.error.error_summary.indexOf('path/conflict/folder') > -1;
}

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