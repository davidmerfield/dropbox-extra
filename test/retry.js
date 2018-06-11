var retry = require('../util/retry');

function retryableError (options) {
  options = options || {};
  var err = new Error();
  err.status = options.status || 429;
  err.retry_after = options.retry_after || null;
  return err;
}

function unRetryableError (options) {
  options = options || {};
  var err = new Error();
  err.status = options.status || 400;
  return err;
}

describe("retry", function() {

  it("should run the main function", function(done){
    retry(function(){}, done, function(){});
  });
  
  it("should retry the main function once", function(done){

    function callback() {
      expect(errHandlerInvoked).toBe(0);
      expect(mainInvoked).toBe(2);
      done();
    }

    var err;
    var errHandlerInvoked = 0;
    var mainInvoked = 0;

    retry(callback, function (onErr){

      mainInvoked++;

      if (!err) {

        err = new Error();
        err.status = 429;
        onErr(err);

      } else {

        done();
      }

    }, function(){

      errHandlerInvoked++;
      callback();
    });
  });

  it("should retry the main function until limit is reached", function(done){

    var invoked = {callback: 0, main: 0, errHandler: 0};

    function callback (err) {
      
      invoked.callback++;

      expect(invoked.main).toBe(11);
      expect(invoked.callback).toBe(1);
      expect(invoked.errHandler).toBe(0);
      expect(err.status).toBe(429);

      done();
    }

    retry(callback, function (onErr){
      
      invoked.main++;
      onErr(retryableError());

    }, function(){
      invoked.errHandler++;
      callback();
    });

  });

  it("should not retry certain errors", function(done){

    var invoked = {callback: 0, main: 0, errHandler: 0};

    function callback () {
      
      invoked.callback++;

      expect(invoked.main).toBe(1);
      expect(invoked.callback).toBe(1);
      expect(invoked.errHandler).toBe(1);

      done();
    }

    retry(callback, function (onErr){
      
      invoked.main++;
      onErr(unRetryableError());

    }, function(){
      invoked.errHandler++;
      callback();
    });

  });

  it("should allow error handler to retry main function", function(done){

    var invoked = {callback: 0, main: 0, errHandler: 0};
    var has_run = false;

    function callback () {
      
      invoked.callback++;

      expect(invoked.main).toBe(2);
      expect(invoked.callback).toBe(1);
      expect(invoked.errHandler).toBe(1);

      done();
    }

    retry(callback, function (onErr){
      
      invoked.main++;

      if (has_run) {
        callback();
      } else {
        has_run = true;
        onErr(unRetryableError());        
      }

    }, function(err, retry){
      
      invoked.errHandler++;
      retry();
    });

  });

  fit("should only allow the callback called once", function(done){

    var invoked = {callback: 0, main: 0, errHandler: 0};

    function callback () {
      
      invoked.callback++;

      expect(invoked.main).toBe(1);
      expect(invoked.callback).toBe(1);
      expect(invoked.errHandler).toBe(0);

      done();
    }

    retry(callback, function (){
      
      invoked.main++;
      
      callback(); callback();
  
      setTimeout(function(){

        callback(); callback();

      }, 10);

    }, function(){
      
      invoked.errHandler++;
      callback(); 
    });

  });
});