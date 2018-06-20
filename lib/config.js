'use strict';

const fs             = require('fs');
const path           = require('path');

/**
 * Returns an object with all configuration settings found in `package.json` and `config.json`.
 */
const pkg    = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
let config   = {};
try {
  config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'user', 'config.json'), 'utf8'));
} catch (e) {
  config = {
    notInitialized: true
  };
}

if (!config.language && process.env && process.env.LANG) {
  config.language = process.env.LANG.replace(/^([a-zA-Z]+).*?$/, '$1');
}

config.theme              = config.theme         || 'default';
config.htdocs             = config.htdocs        || {};
config.directories        = pkg.directories;
config.directories.user   = path.join(process.cwd(), pkg.directories.user);
config.directories.data   = path.join(process.cwd(), pkg.directories.data);
config.directories.htdocs = path.join(process.cwd(), pkg.directories.htdocs);
config.directories.themeBase = path.join(__dirname, '..', pkg.directories.theme);
config.htdocs.theme       = config.htdocs.theme  || 'themes/' + config.theme;
config.directories.theme  = path.join(process.cwd(), pkg.directories.theme);
config.directories.currentTheme = path.join(config.directories.theme, config.theme);
config.isWin              = /^win/.test(process.platform);
config.baseUrl            = config.baseUrl       || 'http://' + (require('os').hostname() || 'example.com');
config.basePath           = config.basePath      || '/';
config.absoluteBasePath   = config.baseUrl + config.basePath;
config.domain             = config.baseUrl.replace(/^[a-z]+:\/\//, '');
config.isHttps            = config.baseUrl.match(/^https:\/\//);
config.locale             = config.locale || {};
config.locale.language    = config.locale.language  || config.language || 'en';
config.locale.direction   = config.locale.direction || (config.locale.language.match(/^(ar|zh|fa|he)/) ? 'rtl' : 'ltr');
config.itemsPerPage       = Number(config.itemsPerPage) || 5;
config.defaultAuthor      = config.defaultAuthor        || {};
config.defaultAuthor.name = config.defaultAuthor.name   || config.name;
config.defaultAuthor.email= config.defaultAuthor.email  || 'info@'+config.domain;
config.copyright          = config.copyright            || undefined;
config.tags               = config.tags          || [];
config.categories         = config.categories    || [];
config.htdocs.posts       = config.htdocs.posts  || 'posts';
config.htdocs.tag         = config.htdocs.tag    || 'tagged';
config.htdocs.author      = config.htdocs.author || 'authored-by';
config.htdocs.category    = config.htdocs.category   || 'category';
config.html               = config.html              || {};
config.htmlAnalytics      = config.htmlAnalytics     || '<!-- Add analytics here -->';
config.htmlAnalyticsAmp   = config.htmlAnalyticsAmp  || '<!-- Add AMP analytics here -->';
config.htmlAnalyticsFeed  = config.htmlAnalyticsFeed || '<!-- Add Feed analytics here with %url and %title -->';
config.specialFeatures    = {};
if (config.useSpecialFeature) {
  config.useSpecialFeature.forEach(function(v) {
    config.specialFeatures[v.toLowerCase().replace(/[^a-z]/g, '')] = true;
  });
}

try {
  config.themeConf = JSON.parse(fs.readFileSync(path.join(config.directories.currentTheme, 'theme.json'), 'utf8'));
  config.themeConf.icons = config.themeConf.icons.map(function(icon) {
    if (!icon.src.match(/^http/)) {
      icon.src = config.absoluteBasePath + config.htdocs.theme + '/' + icon.src;
    }
    return icon;
  });
  if (!config.themeConf.ogImage.match(/^http/)) {
    config.themeConf.ogImage = config.absoluteBasePath + config.htdocs.theme + '/' + config.themeConf.ogImage;
  }
} catch (e) {
  config.themeConf = {};
}

module.exports = config;
