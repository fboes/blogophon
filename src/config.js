'use strict';

var fs             = require('fs');
var path           = require('path');


/**
 * Returns an object with all configuration settings found in `package.json` and `config.json`.
 */
var pkg    = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
var config = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'user/config.json'), 'utf8'));
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
config.directories.user   = path.join(process.cwd(), pkg.directories.user);
config.directories.data   = path.join(process.cwd(), pkg.directories.data);
config.directories.htdocs = path.join(process.cwd(), pkg.directories.htdocs);
config.directories.theme  = path.join(process.cwd(), pkg.directories.theme);

config.isWin = /^win/.test(process.platform);


config.directories.currentTheme = config.directories.theme + (config.theme ? '/' + config.theme : '/default');
config.absoluteBasePath = config.baseUrl + config.basePath;

config.specialFeatures = {};
if (config.useSpecialFeature) {
  config.useSpecialFeature.forEach(function(v) {
    config.specialFeatures[v.toLowerCase().replace(/[^a-z]/g,'')] = true;
  });
}

if (!config.baseUrl) {
  config.baseUrl = "http://" + (os ? os.hostname() : 'example.com');
}
config.domain = config.baseUrl.replace(/^[a-z]+:\/\//,'');
if (!config.basePath) {
  config.basePath = "/";
}

try {
  config.themeConf = JSON.parse(fs.readFileSync(path.join(config.directories.currentTheme, 'theme.json'), 'utf8'));
} catch (e) {
  config.themeConf = {};
}

if (config.deployCmd && config.deployCmd.match(/^#/)) {
  // delete deployment command with `#` at beginning
  config.deployCmd = null;
}

module.exports = config;
