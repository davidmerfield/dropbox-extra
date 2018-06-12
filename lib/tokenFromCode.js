var https = require('https');

module.exports = function (key, secret, code, options, callback) {

  var path, arg;

  if (callback === undefined && typeof options === 'function') {
    callback = options;
    options = {};
  }

  path = '/oauth2/token?code=' + code + '&grant_type=authorization_code';

  if (options.redirect_uri) {
    path += 'redirect_uri=' + options.redirect_uri;
  }

  arg = {
    hostname: 'api.dropboxapi.com',
    path: path,
    method: 'POST',
    headers: {
      Authorization: 'Basic ' + new Buffer(key + ':' + secret).toString('base64')
    }
  };

  make_request(arg, function(err, account_id, access_token){

    callback(err, access_token);
  });
};

function make_request (options, callback) {

  var request;
  var raw;
  var parsed = {};

  request = https.request(options, function (data) {

    raw = '';

    data.on('data', function (chunk) {raw += chunk;});

    data.on('end', function ()  {

      try {
        parsed = JSON.parse(raw);
      } catch (e) {
        return callback(e);
      }

      return callback(null, parsed.account_id, parsed.access_token);
    });
  });

  request.end();
}