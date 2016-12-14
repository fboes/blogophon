'use strict';

var fs   = require('fs');
var path = require('path');

/**
 * Basic apllication stuff
 * @constructor
 */
var application = function() {
  var external = {};

  /**
   * Search upward until valid project is found, and cange into this directory.
   * @return {[type]} [description]
   */
  external.changeDirectory = function () {
    var foundDirectory = external.findDirectory();
    //console.log(foundDirectory);
    if (foundDirectory) {
      process.chdir(foundDirectory);
    }
  };

  /**
   * Recursively find directory.
   * @return {[type]} [description]
   */
  external.findDirectory = function( dir ) {
    dir = dir || process.cwd();
    if (dir === path.join(dir, '..')) {
      return null;
    } else if (fs.existsSync(path.join(dir, 'user', 'config.json'))) {
      return dir;
    } else {
      return external.findDirectory(path.join(dir, '..'));
    }
  };

  return external;
};

module.exports = application;
