import fs from 'fs';
import path from 'path';

/**
 * Basic apllication stuff
 * @constructor
 * @return {Object} [description]
 */
const application = {

  /**
   * Search upward until valid project is found, and cange into this directory.
   * @return {[type]} [description]
   */
  changeDirectory: function() {
    let foundDirectory = this.findDirectory();
    //console.log(foundDirectory);
    if (foundDirectory) {
      process.chdir(foundDirectory);
    }
  },

  /**
   * Recursively find directory.
   * @param  {String} dir [description]
   * @return {String}     [description]
   */
  findDirectory: function( dir ) {
    dir = dir || process.cwd();
    if (dir === path.join(dir, '..')) {
      return null;
    } else if (fs.existsSync(path.join(dir, 'user', 'config.json'))) {
      return dir;
    }
    return this.findDirectory(path.join(dir, '..'));

  }
};

export default application;
