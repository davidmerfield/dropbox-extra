module.exports = function (path) {
  
  if (path === '/') {
    path = "";
  }

  if (path[0] !== '/' && path.length) {
    path = '/' + path;
  }

  return path;
};