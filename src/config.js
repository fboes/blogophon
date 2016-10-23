'use strict';

var pkg            = require('../package.json');

/**
 * Returns an object with all configuration settings found in `package.json` and `config.json`.
 */
var config = {};
try {
  config = require(process.env.PWD + '/user/config.json');
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
if (!config.imageStyles) {
  config.imageStyles = {
    "default": {
      "srcset": [
        [1024,768]
      ],
      "sizes": [
        "100vw"
      ]
    },
    "quad": {
      "srcset": [
        [240,240],
        [480,480]
      ],
      "sizes": [
        "33vw"
      ]
    },
    "openGraph": {
      "srcset": [
        [600,600]
      ]
    }
  };
}

if (config.deployCmd && config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports = config;
