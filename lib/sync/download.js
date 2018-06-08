var debug = require('debug')('dropbox-extra:sync:download');
var fs = require('fs-extra');
var async = require('async');

module.exports = function download (dbDownload, paths, callback) {

    // we need to remove files which already exist
    // removing needs to happen before downloading
    // there might be an existing folder in the place
    // of a file that needs to download. this will 
    // cause an error if it is not caught...

    // i believe fs.ensureFile might have our back?

    var tasks = paths.map(function(path){

      return function (done){

        debug('Removing in preparation to download', path.local);      
        fs.remove(path.local, function(err){

          if (err) return done(err);

          debug('Downloading', path.dropbox, 'to', path.local); 
          dbDownload(path.dropbox, path.local, done);
        });
      };
    });

    async.parallelLimit(tasks, 10, callback);
};