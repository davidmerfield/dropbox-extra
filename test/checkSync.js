var dropbox = global.dropbox;
var join = require('path').join;
var async = require('async');
var debug = require('debug')('dropbox-extra:tests:checkSync');
var fs = require('fs-extra');

module.exports = function checkSync (dbRoot, fsRoot, callback) {

  debug('db reading', dbRoot);

  dropbox.readdir(dbRoot, function(dbErr, dbContents){

    debug('fs reading', dbRoot);
  
    fs.readdir(fsRoot, function(fsErr, fsContents){

      debug('fs err', fsErr);
      debug('db err', dbErr);

      debug('fs Contents', fsContents);
      debug('db Contents', dbContents);
      
      if (fsErr || dbErr) return callback(fsErr || dbErr);

      if (!arraysEqual(dbContents, fsContents)) {
        console.log('DB', dbContents);
        console.log('FS', fsContents);
        return callback(new Error('Contents are not equal'));
      }

      async.eachOf(dbContents, function(name, index, next){

        fs.stat(join(fsRoot, name), function(fsErr, fsStat){

          dropbox.stat(join(dbRoot, name), function(dbErr, dbStat){

            if (fsErr || dbErr) return next(fsErr || dbErr);

            if (fsStat.isDirectory() !== dbStat.isDirectory()) {
              return next(new Error(join(fsRoot, name) + ' isDirectory does not match'));
            }
            
            if (fsStat.isFile() !== dbStat.isFile()) {
              return next(new Error(join(fsRoot, name) + ' isFile does not match'));
            }

            if (dbStat.isDirectory()) {
              return checkSync(join(dbRoot, name), join(fsRoot, name), next);              
            }

            if (fsStat.size !== dbStat.size) {
              return next(new Error(join(fsRoot, name) + ' Size does not match'));
            }

            if (fsStat.mtime.valueOf() !== dbStat.mtime.valueOf()) {
              return next(new Error(join(fsRoot, name) + ' mtime does not match'));
            }

            next(null);
          });
        });
      }, function(err){

        if (err) return callback(err);

        debug('calling back now...');
        callback(null);
      });
    });
  });
};


function arraysEqual (arr1, arr2) {

    // sort the arrays
    arr1.sort();
    arr2.sort();

    if(arr1.length !== arr2.length)
        return false;
    for(var i = arr1.length; i--;) {
        if(arr1[i] !== arr2[i])
            return false;
    }

    return true;
}
