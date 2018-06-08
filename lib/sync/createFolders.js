var debug = require('debug')('dropbox-extra:sync:createFolders');
var fs = require('fs-extra');
var async = require('async');

module.exports = function createFolders (paths, callback) {

    debug('folders to create', paths);

    var tasks = paths.map(function(path){
      debug('making folder', path);
      return fs.ensureDir.bind(this, path);
    });

    async.parallelLimit(tasks, 10, function(){
      debug('done createFolders');
      callback();
    });
  };