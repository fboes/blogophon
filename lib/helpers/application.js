'use strict';

// Node.js internal
const fs   = require('fs');
const path = require('path');

/**
 * Basic apllication stuff
 * @constructor
 * @return {Object} [description]
 */
const application = function() {
  const external = {};

  /**
   * Search upward until valid project is found, and cange into this directory.
   * @return {[type]} [description]
   */
  external.changeDirectory = function() {
    let foundDirectory = external.findDirectory();
    //console.log(foundDirectory);
    if (foundDirectory) {
      process.chdir(foundDirectory);
    }
  };

  /**
   * Recursively find directory.
   * @param  {String} dir [description]
   * @return {String}     [description]
   */
  external.findDirectory = function( dir ) {
    dir = dir || process.cwd();
    if (dir === path.join(dir, '..')) {
      return null;
    } else if (fs.existsSync(path.join(dir, 'user', 'config.json'))) {
      return dir;
    } 
    return external.findDirectory(path.join(dir, '..'));
    
  };

  return external;
};

module.exports = application;
