module.exports = function (jasmine, limit) {
  var originalTimeout;

  return {
    extend: function () {
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      jasmine.DEFAULT_TIMEOUT_INTERVAL = limit || 20000; // 20s
    }, 
    reset: function() {
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
    }
  };
};