'use strict';

var fs             = require('fs-extra');
var config         = JSON.parse(fs.readFileSync('./user/config.json'));
var pkg            = JSON.parse(fs.readFileSync('./package.json'));

config.directories = pkg.directories;

module.exports     = config;
