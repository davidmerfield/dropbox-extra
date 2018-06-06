var readdirp = require('readdirp');
var debug = require('debug')('dropbox-extra:sync:initial');
var normalizePath = require('../../util/normalizePath');
var async = require('async');
var fs = require('fs-extra');
var join = require('path').join;

module.exports = function (client, download, dropboxPath, localPath, callback) {

  var toRemove, foldersToAdd, filesToEnsureAreUpdates;

  readdirp({root: localPath}, function(){}, function(err, localContents){

    if (err) return callback(err);

    dropboxPath = normalizePath(dropboxPath);

    client.filesListFolder({path: dropboxPath, recursive: true})
      .then(function(res){

      // think about case sensitivity


      // All the files which exist on the local branch
      // but don't exist on dropbox
      // files and folders to remove
      toRemove = localContents.directories.filter(function(stat){
        return res.entries.filter(function(dbStat){
          return dbStat.path_lower === '/' + stat.path;
        }).length === 0;
      }).concat(localContents.files.filter(function(stat){
        return res.entries.filter(function(dbStat){
          return dbStat['.tag'] === 'file' && dbStat.path_lower === '/' + stat.path;
        }).length === 0;
      }));

      foldersToAdd = res.entries.filter(function(entry){
        return entry['.tag'] === 'folder' && localContents.directories.filter(function(stat){
          return entry.path_lower === '/' + stat.path;
        }).length === 0;
      });

      filesToEnsureAreUpdates = res.entries.filter(function(entry){
        return entry['.tag'] === 'file';
      });

      debug('toRemove', toRemove);
      debug('foldersToAdd', foldersToAdd);
      debug('filesToEnsureAreUpdates', filesToEnsureAreUpdates);

      async.eachOf(toRemove, function(stat, index, next){

        debug('Removing', stat.fullPath);
        fs.remove(stat.fullPath, next);

      }, function(err){

        if (err) return callback(err);

        async.eachOf(foldersToAdd, function(entry, index, next){

          debug('Creating dir', join(localPath, entry.path_display));
          // think about case sensitivity
          fs.ensureDir(join(localPath, entry.path_display), next);

        }, function(err){
          
          if (err) return callback(err);
        
          async.eachOf(filesToEnsureAreUpdates, function(entry, index, next){

            // think about case sensitivity
            debug('Downloading', join(localPath, entry.path_display));
            download(entry.path_lower, join(localPath, entry.path_display), next);

          }, function(err){
              
            debug('All done');
            
            if (err) return callback(err);
        
            callback(null);
          });
        });
      });
    })
    .catch(callback);

  });
};