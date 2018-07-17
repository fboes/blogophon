'use strict';

/**
 * Represents all posts
 * @constructor
 * @param  {Object} config [description]
 * @return {Object}        [description]
 */
const manifest = function(config) {
  return {
    lang: config.locale.language,
    name: config.name || '',
    description: config.description || '',
    short_name: config.name ? config.name.replace(/^(.{0,12})(\W.*?)$/, '$1') : '',
    icons: !config.themeConf.icons ? [] : config.themeConf.icons.map(function(i) {
      if (i.sizes === 'any') {
        delete i.sizes;
      }
      return i;
    }),
    scope: config.baseUrl + config.basePath,
    start_url: config.baseUrl + config.basePath +'index.html?utm_source=manifest',
    theme_color: config.themeConf.themeColor || '#ffffff',
    background_color: '#ffffff'
  };
};

module.exports = manifest;
