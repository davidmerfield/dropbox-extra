var fs = require('fs-extra');

module.exports = function (cb) {
  fs.emptyDir(__dirname + '/data', cb);
};