var validatePath = require('./validatePath');

module.exports = function (path) {
  
  validatePath(path);

  // Root should be blank?
  if (path === '/') {
    path = "";
  }

  if (path[0] !== '/' && path.length) {
    path = '/' + path;
  }

  return path;
};