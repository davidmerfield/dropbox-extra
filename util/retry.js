var debug = require('debug')('dropbox-extra:retry');

// HTTP error codes
var RETRY_CODES = [
  
  0, 500, 504, // network error

  429, 503 // rate limit error
]; 

// 100-200ms between requests
var INTERVAL = 100;
var JITTER = 100;

// Max retries
var LIMIT = 10;

module.exports = function retry (callback, main, handleErr, options) {

  options = options || {};

  var retries = 0;
  var interval = options.interval || INTERVAL;
  var jitter = options.jitter || JITTER;
  var limit = options.limit || LIMIT;
  var delay = 0;

  debug('Initialized retry, interval:' + interval + ' limit:' + limit);
  
  function retryMain () {

    debug('Waiting ' + delay + 'ms to retry main function');

    setTimeout(function(){

      retries++;

      debug('Retrying main function for the ' + retries + ' time');

      main(handleErrWrapper);

    }, delay);
  }

  function handleErrWrapper (err){

    debug('Error wrapper invoked');

    if (retries >= limit) {
      debug('Hit limit, end now');
      return callback(err);
    }

    // Calculate the delay for the next retry if it is invoked
    if (err.error && err.error.error && err.error.error.retry_after) {
      delay = err.error.error.retry_after * 1000;        
    } else {
      delay = interval + (jitter * Math.random());
    }
    
    // We know this err is retryable immediately
    if (RETRY_CODES.indexOf(err.status) !== -1) {
      debug(err.status + 'is retryable');
      return retryMain();
    }
    
    if (!handleErr) {
      return callback(err);
    }

    try {
      handleErr(err, retryMain);
    } catch (e) {
      debug('Error in handler', e);
      callback(e);
    }
  }

  debug('Invoking main');
  main(handleErrWrapper);
};