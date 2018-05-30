module.exports = function (path) {
  
  // Root should be blank?
  if (path === '/') {
    path = "";
  }

  if (path[0] !== '/' && path.length) {
    path = '/' + path;
  }

  return path;
};