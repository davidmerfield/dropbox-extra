var debug = require('debug')('dropbox-extra:sync:initial');
var normalizePath = require('../../util/normalizePath');
var async = require('async');
var fs = require('fs-extra');
var join = require('path').join;
var localFilesListFolder = require('./localFilesListFolder');
var computeRelativePath = require('./computeRelativePath');

module.exports = function (client, dbDownload, dropboxFolder, localFolder, callback) {

  dropboxFolder = normalizePath(dropboxFolder);

  async.parallel([

    localFilesListFolder.bind(this, {path: localFolder, recursive: true}),

    dropboxFilesListFolder.bind(this, {path: dropboxFolder, recursive: true})

  ], function(err, res){

    if (err) {
      debug('err here', err);
      return callback(err);
    }

    var localEntries = res[0].entries;
    var dropboxEntries = res[1].entries;
      
    try {
      
      localEntries = localEntries.map(function(entry){
        entry.relativePath = computeRelativePath(localFolder, entry.path_display);
        return entry;
      });

      dropboxEntries = dropboxEntries.map(function(entry){
        entry.relativePath = computeRelativePath(dropboxFolder, entry.path_display);
        return entry;
      });

    } catch (e) {
      return callback(e);
    }

    async.parallel([

      remove.bind(this, toRemove(localEntries, dropboxEntries)),
      
      download.bind(this, toDownload(localEntries, dropboxEntries)),
      
      createFolders.bind(this, foldersToAdd(localEntries, dropboxEntries))

    ], function(err){

      debug('unvoked');

      if (err) {
        debug('err also here', err);
        return callback(err);
      }

      callback(null);
    });
  });

  function toRemove (localEntries, dropboxEntries) {

    var localRelativePaths, dropboxRelativePaths, pathsToRemove = [];

    localRelativePaths = localEntries.map(function(localEntry){
      return localEntry.relativePath;
    });

    dropboxRelativePaths = dropboxEntries.map(function(dropboxEntry){
      return dropboxEntry.relativePath;
    });

    pathsToRemove = localRelativePaths.filter(function(localRelativePath){
      return dropboxRelativePaths.indexOf(localRelativePath) === -1;
    }).map(function(localRelativePath){
      return join(localFolder, localRelativePath);
    });

    return pathsToRemove;
  }

  function remove (paths, callback) {

    var tasks = paths.map(function(path){
      debug('Removing', path);      
      return fs.remove.bind(this, path);
    });

    async.parallelLimit(tasks, 10, function(){
      debug('done remove');
      callback();
    });
  }





  function toDownload (localEntries, dropboxEntries) {
      
    var pathsToDownload, dropboxFiles, localFiles, localRelativePaths;
    var filesWhichNeedToBeDownloaded;

    dropboxFiles = dropboxEntries.filter(function(dropboxEntry){
      return dropboxEntry['.tag'] === 'file';
    });

    localFiles = localEntries.filter(function(localEntry){
      return localEntry['.tag'] === 'file';
    });

    debug('dropbox', dropboxFiles);
    debug('LOCAL', localFiles);

    localRelativePaths = localFiles.map(function(localEntry){
      return localEntry.relativePath;
    });

    debug('LOCAL paths', localRelativePaths);

    filesWhichNeedToBeDownloaded = dropboxFiles.filter(function(dropboxEntry){

      var localCounterpart = localFiles.filter(function(localEntry){
        return localEntry.relativePath === dropboxEntry.relativePath;
      })[0];

      debug('localCounterpart', localCounterpart);
      if (localCounterpart) debug('local content_hash', localCounterpart.content_hash);
      debug('dropbox content_hash', dropboxEntry.content_hash);

      return !localCounterpart || localCounterpart.content_hash !== dropboxEntry.content_hash;
    });

    pathsToDownload = filesWhichNeedToBeDownloaded.map(function(entry){
      return {
        dropbox: join(dropboxFolder, entry.relativePath),
        local: join(localFolder, entry.relativePath)
      };
    });

    return pathsToDownload;
  }

  function dropboxFilesListFolder (arg, done) {

    client.filesListFolder(arg).then(function(res){

      done(null, res);

    }).catch(done);

  }

  function download (paths, callback) {

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
  }


  function createFolders (paths, callback) {

    debug('folders to create', paths);

    var tasks = paths.map(function(path){
      debug('making folder', path);
      return fs.ensureDir.bind(this, path);
    });

    async.parallelLimit(tasks, 10, function(){
      debug('done createFolders');
      callback();
    });
  }

  function foldersToAdd (localEntries, dropboxEntries) {
    
    var missingFolderPaths, dropboxFolders, localFolders;

    dropboxFolders = dropboxEntries.filter(function(dropboxEntry){
      return dropboxEntry['.tag'] === 'folder';
    });

    localFolders = localEntries.filter(function(localEntry){
      return localEntry['.tag'] === 'folder';
    }); 

    debug('dropbox folders', dropboxFolders);
    debug('local folders', localFolders);

    missingFolderPaths = dropboxFolders.filter(function(dropboxEntry){

      var localCounterpart = localFolders.filter(function(localEntry){
        return dropboxEntry.relativePath === localEntry.relativePath;
      })[0];

      debug(localCounterpart);

      return !localCounterpart;

    }).map(function(entry){

      return join(localFolder, entry.relativePath);
    });

    debug('missingFolderPaths', missingFolderPaths)

    return missingFolderPaths;
  }

};