var shrub = require('shrub');
var path = require('path');
var minimatch = require('minimatch');
var sizer = {};

// Define our size comparisons 
var methods = {
  'bigger': function (fileSize, baseSize) {
    return fileSize > baseSize;
  },
  
  'smaller': function (fileSize, baseSize) {
    return fileSize < baseSize;
  }
}

// Create the sizer methods
Object.keys(methods).forEach(function (method) {
  sizer[method] = function (size, dir, options, callback) {
    if (arguments[3] === undefined) {
      callback = options;
      options = {};
    }
    
    options.ignore = options.ignore || [];
    
    shrub(dir)
      .filter(function (filePath, stats, next) {
        var file = filePath.replace(process.cwd() + '/', ''); // get relative path
        var shouldIgnore = options.ignore.filter(function (glob) {
          return minimatch(file, glob);
        }).length;
        var tooBig = (shouldIgnore) ? false : methods[method](stats.size, size);
        
        next(tooBig);
      })
      .then(function (filesTooBig) {
        var files = filesTooBig.map(function (file) {
          return file.filePath.replace(process.cwd() + '/', '')
        });
        
        callback(null, files);
      });
  }
});

module.exports = sizer;