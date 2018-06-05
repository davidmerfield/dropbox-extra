require('isomorphic-fetch');

var accessToken = process.env.DROPBOX_TEST_ACCESS_TOKEN;
var Dropbox = require('dropbox').Dropbox;
var client = new Dropbox({accessToken: accessToken});
var async = require('async');

var tasks = [];
var totalErrs = 0;

function write (done) {
  
  client.filesUpload({path: '/foo.txt', contents: 'bar'})
    .then(function(){
      done(null, 'wow');
    })
    .catch(function(){
      totalErrs++;
      done(null, 'WOow');
    });

}

while (tasks.length < 1000) {
  tasks.push(write);
}

console.log(tasks.length);

async.parallelLimit(tasks, 1000, function(err, res){

  if (err) console.log(err);

  console.log(res.length, totalErrs);
  console.log('calling listFolder now...');

  client.filesListFolder({path: ''})
      .then(function(res){
        console.log(res);

      })
      .catch(function(err){

        console.log(err);
      });
});

