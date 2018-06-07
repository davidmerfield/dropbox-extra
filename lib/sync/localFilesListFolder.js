var readdirp = require('readdirp');
var async = require('async');
var dropboxContentHash = require('./dropboxContentHash');

module.exports = function (arg, callback) {

  var res = {};

  res.entries = [];
  
  readdirp({root: arg.path}, function(){}, function(err, entries){

    if (err) return callback(err);

    entries.directories.forEach(function(entry){

      res.entries.push({
        name: entry.name,
        path_lower: entry.fullPath.toLowerCase(),
        path_display: entry.fullPath,
        '.tag': 'folder'
      });
    });

    async.eachOf(entries.files, function(entry, i, next){

      dropboxContentHash(entry.fullPath, function(err, contentHash){

        if (err) return next(err);

        res.entries.push({
         '.tag': 'file',
          name: entry.name,
          path_lower: entry.fullPath.toLowerCase(),
          path_display: entry.fullPath,
          client_modified: entry.stat.mtime.toISOString().split('.')[0]+"Z",
          server_modified: entry.stat.mtime.toISOString().split('.')[0]+"Z",
          size: entry.stat.size,
          content_hash: contentHash
        });

        next();
      });      

    }, function(err){

      if (err) return callback(err);
        
      callback(null, res);
    });
  });
}