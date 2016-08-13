'use strict';

var fs             = require('fs-extra');
var config         = JSON.parse(fs.readFileSync('./user/config.json'));
var pkg            = JSON.parse(fs.readFileSync('./package.json'));

config.directories = pkg.directories;

if (config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports     = config;
