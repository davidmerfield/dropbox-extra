var debug = require('debug')('dropbox-extra:sync:initial');

var dropboxFilesListFolderContinue = require('./dropboxFilesListFolderContinue');

var addRelativePath = require('./addRelativePath');
var resolve = require('./resolve');

module.exports = function (client, dbDownload, dropboxFolder, localFolder, cursor, callback) {

  var localEntries, dropboxEntries;


  debug('retrieving latest entries from dropbox');

  dropboxFilesListFolderContinue(client, {cursor: cursor}, function(err, res){

    if (err) {
      debug('failed to retrieve entries', err);
      return callback(err);
    }

    // we can recompute the dropbox folder here based on the paths...?
    // what happens when the folder moves?

    // we assume the local folder has not changed. This is obviously a big assumption
    localEntries = [];

    // 
    dropboxEntries = res.entries;

    // we add the relative path to each dropbox entry. This is needed
    // 
    dropboxEntries = dropboxEntries.map(addRelativePath(dropboxFolder));

    // this function is shared with initial
    resolve(dbDownload, localEntries, localFolder, dropboxEntries, function(err, additions, deletions){

      callback(null, cursor, additions, deletions);
    });
  });
};