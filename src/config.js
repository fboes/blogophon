'use strict';

//var path           = require('path');
var pkg            = require('../package.json');

/**
 * Returns an object with all configuration settings found in `package.json` and `config.json`.
 */
var config = {};
try {
  config = require(__dirname + '/../user/config.json');
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
  config.themeConf = require(__dirname + '/../' + config.directories.currentTheme + '/theme.json');
} catch (e) {
  config.themeConf = {};
}

if (config.deployCmd && config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports = config;
