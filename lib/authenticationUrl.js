var Dropbox = require('dropbox').Dropbox;

module.exports = function (key, secret, callback) {

  var client = new Dropbox({
    "clientId": key,
    "secret": secret
  });

  var authentication_url = client.getAuthenticationUrl(callback, null, 'code');
  authentication_url = authentication_url.replace('response_type=token', 'response_type=code');

  if (callback) callback(null, authentication_url);

  return authentication_url;
};