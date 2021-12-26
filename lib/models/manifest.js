import categoryUrl from '../helpers/category-url.js';

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
    short_name: config.shortName || config.name || '',
    icons: config.themeConf.icons ? config.themeConf.icons.filter((icon) => {
      return !icon.src.match(/^http/) || icon.src.match(RegExp('^' + config.baseUrl));
    }) : [],
    scope: config.baseUrl + config.basePath,
    display: 'minimal-ui',
    orientation: 'any',
    start_url: config.baseUrl + config.basePath + '?utm_source=manifest',
    theme_color: config.themeConf.themeColor || '#ffffff',
    background_color: '#ffffff',
    screenshots: [],
    categories: ['blog'],
    shortcuts: config.categories.map((category) => {
      return {
        name: category,
        url: categoryUrl(category, config.htdocs.category).relativeUrl()
      };
    })
  };
};

export default manifest;
