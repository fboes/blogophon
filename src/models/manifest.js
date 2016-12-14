'use strict';

/**
 * Represents all posts
 * @constructor
 */
var manifest = function(config) {
  return {
    lang: config.language,
    name: config.name || '',
    description: config.description || '',
    short_name: config.name || '',
    icons: !config.themeConf.icons ? [] : config.themeConf.icons.map(function(i) {
      return i;
    }),
    scope: config.baseUrl + config.basePath,
    start_url: config.baseUrl + config.basePath +'index.html?utm_medium=manifest',
    theme_color: config.themeConf.themeColor || '#ffffff',
    background_color: '#ffffff'
  };
};

module.exports = manifest;
