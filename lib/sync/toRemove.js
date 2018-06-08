var join = require('path').join;
var debug = require('debug')('dropbox-extra:sync:toRemove');

module.exports = function toRemove (localFolder, localEntries, dropboxEntries) {

  debug('Started!', localFolder, localEntries, dropboxEntries);

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

  pathsToRemove = pathsToRemove.concat(dropboxEntries.filter(function(dropboxEntry){

    return dropboxEntry['.tag'] === 'deleted';

  }).map(function(dropboxEntry){
    return join(localFolder, dropboxEntry.relativePath);
  }));

  debug('Done!');

  return pathsToRemove;
};