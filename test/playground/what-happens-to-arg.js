require('isomorphic-fetch');

var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var Dropbox = require('dropbox').Dropbox;
var client = new Dropbox({accessToken: accessToken});

var arg = {
      path: '/foo.txt',
      contents: 'bar',
};

console.log('BEFORE', arg);

client.filesUpload(arg).then(function(res){

  console.log('AFTER', arg);

}).catch(function(err){

  throw err;

});
