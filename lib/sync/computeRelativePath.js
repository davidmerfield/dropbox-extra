var assert = require('assert');

function computeRelativePath (root, path) {

  if (root[0] !== '/') root = '/' + root;
  if (path[0] !== '/') path = '/' + path;

  console.log(root, path);
  
  if (path.toLowerCase().indexOf(root.toLowerCase()) !== 0) {
    throw new Error('Path (' + path + ') must be inside root (' + root + ')');
  } 

  if (path.length <= root.length) {
    throw new Error('Path (' + path + ') must be inside root (' + root + ')');
  }

  path = path.slice(root.length);

  if (path[0] !== '/') path = '/' + path;

  return path;
}

// Basic sanity check
assert(computeRelativePath('/foo', '/foo/bar') === '/bar');
assert(computeRelativePath('/a/b', '/a/b/c/d') === '/c/d');
assert(computeRelativePath('', 'rabbit.txt') === '/rabbit.txt');

// Should be indifferent about leading slashes
assert(computeRelativePath('foo', '/foo/bar') === '/bar');
assert(computeRelativePath('/foo', 'foo/bar') === '/bar');

assert.throws(computeRelativePath.bind(this, '/foo', '/bar'));
assert.throws(computeRelativePath.bind(this, '/', '/'));

module.exports = computeRelativePath;