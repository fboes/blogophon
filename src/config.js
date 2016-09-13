'use strict';

var fs             = require('fs');
var pkg            = require('../package.json');

/**
 * Returns an object with all configuration settings found in `package.json` and `config.json`.
 */
var config = {};
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

config.imageFormats = {};
config.imageSizes = config.imageSizes.map(function(size) {
  var ratio = size[0] / size[1];
  size[2] = '';

  if (ratio <= 1/2) {
    size[2] = '1:2';
  }
  else if (ratio <= 1/1.3) {
    size[2] = '3:4';
  }
  else if (ratio <= 1/1.7) {
    size[2] = '9:16';
  }
  else if (ratio === 1) {
    size[2] = '1:1';
  }
  else if (ratio >= 2) {
    size[2] = '2:1';
  }
  else if (ratio >= 1.7) {
    size[2] = '16:9';
  }
  else if (ratio >= 1.3) {
    size[2] = '4:3';
  }

  if (size[2]) {
    if (!config.imageFormats[size[2]]) {
      config.imageFormats[size[2]] = [];
    }
    config.imageFormats[size[2]].push(size);
  }

  return size;
});

if (config.deployCmd && config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports = config;
