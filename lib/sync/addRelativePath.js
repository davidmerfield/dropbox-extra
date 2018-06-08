var assert = require('assert');

function relativePath (root, path) {

  if (root[0] !== '/') root = '/' + root;
  if (path[0] !== '/') path = '/' + path;

  if (path.length <= root.length) {
    throw new Error('Path (' + path + ') must be inside root (' + root + ')');
  }
  
  if (path.toLowerCase().indexOf(root.toLowerCase()) !== 0) {
    throw new Error('Path (' + path + ') must be inside root (' + root + ')');
  } 

  path = path.slice(root.length);

  if (path[0] !== '/') path = '/' + path;

  return path;
}

// Basic sanity check
assert(relativePath('/foo', '/foo/bar') === '/bar');
assert(relativePath('/a/b', '/a/b/c/d') === '/c/d');
assert(relativePath('', 'rabbit.txt') === '/rabbit.txt');
assert(relativePath('/', 'rabbit.txt') === '/rabbit.txt');

// Should be indifferent about leading slashes
assert(relativePath('foo', '/foo/bar') === '/bar');
assert(relativePath('/foo', 'foo/bar') === '/bar');

assert.throws(relativePath.bind(this, '/foo', '/bar'));
assert.throws(relativePath.bind(this, '/', '/'));

module.exports = function addRelativePath (root){

  return function (entry) {

    entry.relativePath = relativePath(root, entry.path_display);
    return entry;
  };
};