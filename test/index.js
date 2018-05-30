var Jasmine = require('jasmine');
var jasmine = new Jasmine();
var config = {
  "spec_dir": "test",
  "spec_files": ["*.js"],
  "helpers": [
    "helpers/**/*.js"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": true
};

// Pass in a custom test glob for running only specific tests
if (process.env.TEST) {
  console.log('Running', process.env.TEST);
  config["spec_files"] = [process.env.TEST];
}

jasmine.loadConfig(config);

jasmine.execute();