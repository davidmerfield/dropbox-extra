var debug = require('debug')('dropbox-extra:sync:initial');
var normalizePath = require('../../util/normalizePath');
var async = require('async');

var localFilesListFolder = require('./localFilesListFolder');
var dropboxFilesListFolder = require('./dropboxFilesListFolder');

var addRelativePath = require('./addRelativePath');
var foldersToAdd = require('./foldersToAdd');
var filesToDownload = require('./filesToDownload');
var toRemove = require('./toRemove');
var remove = require('./remove');
var download = require('./download');
var createFolders = require('./createFolders');

module.exports = function (client, dbDownload, dropboxFolder, localFolder, callback) {

  var localEntries, dropboxEntries, cursor, newFolders, updates, additions, deletions;

  dropboxFolder = normalizePath(dropboxFolder);

  async.parallel([

    localFilesListFolder.bind(this, {path: localFolder, recursive: true}),

    dropboxFilesListFolder.bind(this, client, {path: dropboxFolder, recursive: true})

  ], function(err, res){

    if (err) {
      return callback(err);
    }

    try {
      
      cursor = res[1].cursor;
      debug('dropbox', dropboxFolder, res[1]);
      debug('local', localFolder, res[0]);

      dropboxEntries = res[1].entries;
      localEntries = res[0].entries;

      // Remove folder from list of entries
      dropboxEntries = dropboxEntries.filter(function(entry){
        return normalizePath(entry.path_lower) !== normalizePath(dropboxFolder.toLowerCase());
      });

      localEntries = localEntries.map(addRelativePath(localFolder));
      dropboxEntries = dropboxEntries.map(addRelativePath(dropboxFolder));


      
    } catch (e) {
      return callback(e);
    }

    newFolders = foldersToAdd(localFolder, localEntries, dropboxEntries);
    updates = filesToDownload(localFolder, localEntries, dropboxEntries);
    deletions = toRemove(localFolder, localEntries, dropboxEntries);

    async.parallel([

      download.bind(this, dbDownload, updates),

      remove.bind(this, deletions),
            
      createFolders.bind(this, newFolders)

    ], function(err){

      if (err) {
        debug('err also here', err);
        return callback(err);
      }

      // We want to get relative paths for these now...
      
      deletions = deletions.map(function(localPath){
        return addRelativePath(localFolder)({path_display: localPath}).relativePath;
      });

      additions = newFolders.map(function(localPath){
        return addRelativePath(localFolder)({path_display: localPath}).relativePath;
      });

      additions = additions.concat(updates.map(function(path){
        return addRelativePath(localFolder)({path_display: path.local}).relativePath;
      }));

      debug('Sync complete');
      callback(null, cursor, additions, deletions);
    });
  });
};


