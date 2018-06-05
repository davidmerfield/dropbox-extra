require('isomorphic-fetch');

var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var Dropbox = require('dropbox').Dropbox;
var client = new Dropbox({accessToken: accessToken});

function doNothing () {}

for (var i = 0; i < 1000; i++) {
  client.filesUpload({path: '/foo.txt', contents: 'bar'})
  .then(function(){
    // console.log('res called')
  })
  .catch(function(){
    // console.log('error called')
  });
}

console.log('calling listFolder now...');

client.filesListFolder({path: ''})
      .then(function(res){
        console.log(res);

      })
      .catch(function(err){

        console.log(err);
      });