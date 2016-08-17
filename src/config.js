'use strict';

var fs             = require('fs-extra');
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
    "deployCmd":"# rsync -az --exclude=node_modules --delete * HOST:PATH && echo \"Pubslished\"",
    "imageSizes": [
      [180,180],
      [400,225],
      [800,450]
    ]
  };
}

config.directories = pkg.directories;

if (config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports     = config;
