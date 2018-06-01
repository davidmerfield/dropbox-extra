module.exports = {

  BADPATH: function () {
    return new TypeError('Pass a path as a string');
  },

  BADCALLBACK: function () {
    return new TypeError('Pass a callback function');
  },
  
  BADTOKEN: function () {
    return new TypeError('Pass an access token');
  }
};