'use strict';

/**
 * List of arguments from command line
 * @constructor
 */
var Arguments = function() {
  var obj = {};
  if (process.argv && process.argv.length > 1) {
    process.argv.forEach(function(arg, i) {
      var m = arg.match(/^\-\-(.+)(?:=(.+))?$/);
      if (i >= 2 && m) {
        obj[m[1]] = m[2] ? m[2] : true;
      }
    });
  }
  return obj;
};

module.exports = Arguments;
