module.exports = function (dropbox) {
  return function (done) {
    dropbox.emptyDir('/', done);
  };
};