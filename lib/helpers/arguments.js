/**
 * List of arguments from command line
 * @constructor
 */
const args = function() {
  const external = {};
  if (process.argv && process.argv.length > 1) {
    process.argv.forEach(function(arg, i) {
      let m = arg.match(/^--?(.+?)(?:=(.+))?$/);
      if (i >= 2 && m) {
        external[m[1].replace(/-+/g, '')] = m[2] ? m[2] : true;
      }
    });
  }
  return external;
};

export default args;
