// Karma configuration
// Generated on Wed May 07 2014 23:32:42 GMT-0500 (Central Daylight Time)


// base path, that will be used to resolve files and exclude
basePath = '../';


// list of files / patterns to load in the browser
files = [
  JASMINE,
  JASMINE_ADAPTER,
  'public/lib/*/angular.js',
  'public/lib/*/angular-mocks.js',
  'public/lib/*/angular-ui-router.js',
  'public/javascripts/**/*.js',
  'public/javascripts/app.js',
  'test/unit/**/*.js',
  'node_modules/chai/chai.js',
  'node_modules/chai-spies/chai-spies.js',
  'test/lib/chai-should.js',
  'test/lib/chai-expect.js'
];


// list of files to exclude
exclude = [
  
];


// test results reporter to use
// possible values: 'dots', 'progress', 'junit'
reporters = ['progress'];


// web server port
port = 9876;


// cli runner port
runnerPort = 9100;


// enable / disable colors in the output (reporters and logs)
colors = true;


// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
logLevel = LOG_INFO;


// enable / disable watching file and executing tests whenever any file changes
autoWatch = true;


// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
browsers = ['Chrome'];


// If browser does not capture in given timeout [ms], kill it
captureTimeout = 60000;


// Continuous Integration mode
// if true, it capture browsers, run tests and exit
singleRun = false;
