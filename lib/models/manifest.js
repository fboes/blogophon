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
    dir: config.locale.direction,
    name: config.name || '',
    description: config.description || '',
    short_name: config.name ? config.name.replace(/^(.{0,12})(\W.*?)$/, '$1') : '',
    icons: config.themeConf.icons || [],
    scope: config.baseUrl + config.basePath,
    display: 'minimal-ui',
    orientation: 'any',
    start_url: config.baseUrl + config.basePath +'?utm_source=manifest',
    theme_color: config.themeConf.themeColor || '#ffffff',
    background_color: '#ffffff'
  };
};

module.exports = manifest;
