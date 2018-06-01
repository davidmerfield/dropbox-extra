module.exports = function (stat, download, upload) {

  return function (arg, callback) {

    arg.cursor
    arg.fromDropbox
    arg.toDropbox

    sync({from: '/', to: __dirname + '/'}, function(err, cursor, changes){

      sync({cursor: cursor}, function(err, cursor, changes){

      });
    });
  }
}