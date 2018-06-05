module.exports = function(err){
  console.log('Hander of last resort!');
  console.log('----------------------');
  console.log(err);
  console.log(err.trace);
  console.log(err.stack);
};