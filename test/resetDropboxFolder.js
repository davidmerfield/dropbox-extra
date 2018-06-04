module.exports = function (dropbox) {
  return dropbox.emptyDir.bind(this, '/');
};