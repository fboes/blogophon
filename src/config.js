'use strict';

var fs             = require('fs');
var config         = {};
var pkg            = JSON.parse(fs.readFileSync('./package.json'));

try {
  config = JSON.parse(fs.readFileSync('./user/config.json'));
} catch (e) {
  config = {
    "basePath": "/",
    "language": "en",
    "itemsPerPage": 5,
    "themeColor": "#ffffff",
    "defaultAuthor": {},
    "deployCmd":"# echo \"Publishing...\" && rsync -az --delete htdocs HOST:PATH && echo \"Published\"",
    "imageSizes": [
      [180,180],
      [400,225],
      [800,450]
    ]
  };
}

config.directories = pkg.directories;

config.directories.currentTheme = pkg.directories.theme + (config.theme ? '/' + config.theme : '');

if (config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports     = config;
