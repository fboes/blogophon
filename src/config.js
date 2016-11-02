'use strict';

//var path           = require('path');
var pkg            = require('../package.json');
var path           = require('path');

/**
 * Returns an object with all configuration settings found in `package.json` and `config.json`.
 */
var config = {};
try {
  config = require(path.join(process.cwd(), 'user/config.json'));
} catch (e) {
  var os = require("os");
  config = {
    "name": "Example",
    "language": "en",
    "itemsPerPage": 5,
    "themeColor": "#ffffff",
    "defaultAuthor": {},
    "deployCmd":"# rsync -az --delete htdocs HOST:PATH",
    "notInitialized":true
  };
}

config.directories = pkg.directories;
config.isWin = /^win/.test(process.platform);

/*
config.directories.user   = path.join(process.cwd(), config.directories.user);
config.directories.data   = path.join(process.cwd(), config.directories.data);
config.directories.htdocs = path.join(process.cwd(), config.directories.htdocs);
config.directories.theme  = path.join(process.cwd(), config.directories.theme);
*/

config.directories.currentTheme = pkg.directories.theme + (config.theme ? '/' + config.theme : '/default');
config.absoluteBasePath = config.baseUrl + config.basePath;

config.specialFeatures = {};
if (config.useSpecialFeature) {
  config.useSpecialFeature.forEach(function(v) {
    config.specialFeatures[v.toLowerCase().replace(/[^a-z]/g,'')] = true;
  });
}

if (!config.baseUrl) {
  config.baseUrl = "http://" + os.hostname();
}
if (!config.basePath) {
  config.basePath = "/";
}

try {
  config.themeConf = require(path.join(process.cwd(), config.directories.currentTheme, 'theme.json'));
} catch (e) {
  config.themeConf = {};
}

if (config.deployCmd && config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports = config;
