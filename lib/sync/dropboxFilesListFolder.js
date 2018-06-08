module.exports = function dropboxFilesListFolder (client, arg, callback) {

  client.filesListFolder(arg).then(function(res){

    callback(null, res);

  }).catch(callback);

};