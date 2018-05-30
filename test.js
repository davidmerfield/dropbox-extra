var Jasmine = require('jasmine');
var jasmine = new Jasmine();
var config = {
  "spec_dir": "lib",
  "spec_files": ["*.test.js"],
  "helpers": [
    "helpers/**/*.js"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": true
};

// Pass in a custom test glob for running only specific tests
if (process.env.TEST) {
  config["spec_files"] = [process.env.TEST];
}

jasmine.loadConfig(config);

jasmine.execute();