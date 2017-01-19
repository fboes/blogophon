'use strict';

var fs             = require('fs');
var path           = require('path');

/**
 * Returns an object with all configuration settings found in `package.json` and `config.json`.
 */
var pkg    = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
var config = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'user', 'config.json'), 'utf8'));
} catch (e) {
  config = {
    notInitialized: true
  };
}

config.directories        = pkg.directories;
config.directories.user   = path.join(process.cwd(), pkg.directories.user);
config.directories.data   = path.join(process.cwd(), pkg.directories.data);
config.directories.htdocs = path.join(process.cwd(), pkg.directories.htdocs);
config.directories.theme  = path.join(process.cwd(), pkg.directories.theme);
config.directories.currentTheme = path.join(config.directories.theme, config.theme || 'default');
config.isWin              = /^win/.test(process.platform);
config.baseUrl            = config.baseUrl       || 'http://' + (require('os').hostname() || 'example.com');
config.basePath           = config.basePath      || '/';
config.absoluteBasePath   = config.baseUrl + config.basePath;
config.domain             = config.baseUrl.replace(/^[a-z]+:\/\//, '');
config.locale             = config.locale || {};
config.locale.language    = config.locale.language  || config.language || process.env.LANG.replace(/^([a-zA-Z]+).*?$/, '$1') || 'en';
config.locale.direction   = config.locale.direction || (config.locale.language.match(/^(ar|zh|fa|he)/) ? 'rtl' : 'ltr');
config.itemsPerPage       = Number(config.itemsPerPage) || 5;
config.defaultAuthor      = config.defaultAuthor        || {};
config.defaultAuthor.name = config.defaultAuthor.name   || config.name;
config.defaultAuthor.email= config.defaultAuthor.email  || 'info@'+config.domain;
config.htdocs             = config.htdocs        || {};
config.htdocs.posts       = config.htdocs.posts  || 'posts';
config.htdocs.tag         = config.htdocs.tag    || 'tagged';
config.htdocs.author      = config.htdocs.author || 'authored-by';
config.specialFeatures    = {};
if (config.useSpecialFeature) {
  config.useSpecialFeature.forEach(function(v) {
    config.specialFeatures[v.toLowerCase().replace(/[^a-z]/g, '')] = true;
  });
}

try {
  config.themeConf = JSON.parse(fs.readFileSync(path.join(config.directories.currentTheme, 'theme.json'), 'utf8'));
} catch (e) {
  config.themeConf = {};
}

module.exports = config;
