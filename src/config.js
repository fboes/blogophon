'use strict';

var fs             = require('fs');
var config         = {};
var pkg            = JSON.parse(fs.readFileSync('./package.json'));

try {
  config = JSON.parse(fs.readFileSync('./user/config.json'));
} catch (e) {
  var os = require("os");
  config = {
    "baseUrl": "http://" + os.hostname(),
    "basePath": "/",
    "language": "en",
    "itemsPerPage": 5,
    "themeColor": "#ffffff",
    "defaultAuthor": {},
    "deployCmd":"# echo \"Publishing...\" && rsync -az --delete htdocs HOST:PATH && echo \"Published\"",
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

config.directories.currentTheme = pkg.directories.theme + (config.theme ? '/' + config.theme : '');

if (config.deployCmd && config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports     = config;
