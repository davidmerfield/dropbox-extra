var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var dropbox = require('../lib')(accessToken);

module.exports = dropbox.emptyDir.bind(this, '/');