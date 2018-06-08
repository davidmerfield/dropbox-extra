var debug = require('debug')('dropbox-extra:sync:resolve');
var foldersToAdd = require('./foldersToAdd');
var filesToDownload = require('./filesToDownload');
var toRemove = require('./toRemove');
var remove = require('./remove');
var download = require('./download');
var createFolders = require('./createFolders');
var async = require('async');
var addRelativePath = require('./addRelativePath');

module.exports = function resolve (dbDownload, localEntries, localFolder, dropboxEntries, callback) {

  var updates, deletions, newFolders, additions;

  updates = filesToDownload(localFolder, localEntries, dropboxEntries);
  deletions = toRemove(localFolder, localEntries, dropboxEntries);
  newFolders = foldersToAdd(localFolder, localEntries, dropboxEntries);

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
    callback(null, additions, deletions);
  });
};
