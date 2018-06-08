module.exports = function dropboxFilesListFolderContinue (client, arg, callback) {

  client.filesListFolderContinue(arg).then(function(res){

    callback(null, res);

  }).catch(callback);

};