var join = require('path').join;
var debug = require('debug')('dropbox-extra:sync:filesToDownload');

module.exports = function filesToDownload (localFolder, localEntries, dropboxEntries) {
    
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
      dropbox: entry.path_display,
      local: join(localFolder, entry.relativePath)
    };
  });

  return pathsToDownload;

};