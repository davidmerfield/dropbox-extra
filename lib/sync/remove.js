var debug = require('debug')('dropbox-extra:sync:remove');
var fs = require('fs-extra');
var async = require('async');

module.exports = function remove (paths, callback) {

    // we should sort paths by depth here,
    // and only remove paths which are not
    // inside another path to be removed
    // e.g. if paths are ['/a/b/c', '/a/b', '/a']
    // we should map this to just ['/a']

    var tasks = paths.map(function(path){
      debug('Removing', path);      
      return fs.remove.bind(this, path);
    });

    async.parallelLimit(tasks, 10, function(){
      debug('done remove');
      callback();
    });
  };