var RETRY_CODES = [0, 500, 504, // network error
    429, 503];     // rate limit error

var debug = require('debug')('dropbox-extra:retry');

var MAX_RETRIES = 10;

// 100-200ms between requests
var INTERVAL = 100;
var JITTER = 100;

module.exports = function (method, args) {

  debug('Initializing retry');

  var retries = 0;

  return function (callback) {
    
    return function handle (err) {

      if (!err) return callback();

      debug('Invoked', err);

      var delay;

      if (RETRY_CODES.indexOf(err.status) === -1) {

        // log all errors hererto see if they can be retried
        debug('Not a known err code');
        debug(err);
        return callback(err);
      }
      
      if (retries >= MAX_RETRIES) {
        debug('Maxed out retries');
        debug(err);
        return callback(err);
      }

      retries++;

      // retry_after is in seconds so we multiply by 1000
      // to get the milliseconds used by setTimeout
      // https://dropbox.github.io/dropbox-sdk-js/global.html#AuthRateLimitError__anchor
      if (err.retry_after) {
        delay = err.retry_after * 1000; 
      } else {
        delay = retries * INTERVAL + (Math.random() * JITTER);
      }

      debug('Retrying....'. delay);
      
      setTimeout(function(){

        args[args.length - 1] = handle;
        
        debug('REtrying now!');
        method.apply(this, args);

      }, delay);
    };
  };
};