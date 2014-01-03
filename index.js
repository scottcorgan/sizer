var shrub = require('shrub');
var path = require('path');
var minimatch = require('minimatch');

var sizer = {
  bigger: function (size, dir, options, callback) {
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
        var tooBig = (shouldIgnore) ? false : stats.size > size;
        
        next(tooBig);
      })
      .then(function (filesTooBig) {
        var files = filesTooBig.map(function (file) {
          return file.filePath.replace(process.cwd() + '/', '')
        });
        
        callback(null, files);
      });
  }
};

module.exports = sizer;