var fs = require('fs-extra');
var DATADIR = __dirname + '/data';
var join = require('path').join;

fs.emptyDirSync(DATADIR);

stattest();

function stattest () {

  fs.outputFile(join(DATADIR, 'bar', 'foo.txt'), 'baz', function(err, stat){

    console.log(err);
    console.log(stat);
      
    fs.stat(join(DATADIR, 'bar'), function(err, stat){

      console.log(err);
      console.log(stat);

      fs.stat(join(DATADIR, 'bar', 'foo.txt'), function(err, stat){
        
        console.log(err);
        console.log(stat);
      }); 
    });
  });

}


function EEXISTS () {

  fs.writeFile(join(DATADIR, 'foo.txt'), 'bar', function(err, stat){

    console.log(err);
    console.log(stat);
      
    fs.ensureDir(join(DATADIR, 'foo.txt'), function(err, stat){

      console.log(err);
      console.log(stat);

      fs.readdir(DATADIR, function(err, stat){
        
        console.log(err);
        console.log(stat);
      }); 
    });
  });

}
