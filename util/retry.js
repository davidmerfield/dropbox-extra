var debug = require('debug')('dropbox-extra:retry');

var RETRY_CODES = [0, 500, 504, // network error
    429, 503];     // rate limit error

// 100-200ms between requests
var INTERVAL = 100;
var JITTER = 100;

// Max retries
var LIMIT = 10;

module.exports = function (options) {

  debug('Initializing retry');

  options = options || {};

  var retries = 0;
  var interval = options.interval || INTERVAL;
  var jitter = options.jitter || JITTER;
  var limit = options.limit || LIMIT;

  return {
    
    maxed: function(){
      return retries >= limit;
    },

    cannot: function(err) {
      return RETRY_CODES.indexOf(err.status) === -1;
    },
    
    wait: function (err, then) {

      var delay;

      if (err.retry_after) {
        delay = err.retry_after * 1000;        
      } else {
        delay = interval + (jitter * Math.random());
      }

      debug('waiting', delay, 'ms');
      
      retries++;
      setTimeout(then, delay);
    }
  };
};