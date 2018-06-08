var join = require('path').join;
var debug = require('debug')('dropbox-extra:sync:foldersToAdd');

module.exports = function foldersToAdd (localFolder, localEntries, dropboxEntries) {
  
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

  debug('missingFolderPaths', missingFolderPaths);

  return missingFolderPaths;
};