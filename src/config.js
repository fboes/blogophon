'use strict';

var fs             = require('fs');
var pkg            = require('../package.json');

/**
 * Returns an object with all configuration settings found in `package.json` and `config.json`.
 */
var config         = {};
try {
  config = require('../user/config.json');
} catch (e) {
  var os = require("os");
  config = {
    "baseUrl": "http://" + os.hostname(),
    "basePath": "/",
    "language": "en",
    "itemsPerPage": 5,
    "themeColor": "#ffffff",
    "defaultAuthor": {},
    "deployCmd":"# rsync -az --delete htdocs HOST:PATH",
    "imageSizes": [
      [180,180],
      [640,480],
      [1024,768]
    ],
    "notInitialized":true
  };
}

config.directories = pkg.directories;
config.isWin = /^win/.test(process.platform);

config.directories.currentTheme = pkg.directories.theme + (config.theme ? '/' + config.theme : '/default');
config.absoluteBasePath = config.baseUrl + config.basePath;

if (config.deployCmd && config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports     = config;
