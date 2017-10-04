'use strict';

let categoryUrl    = require('../helpers/category-url');

let categories = function(config) {
  if (config.categories) {
    return config.categories.map(function(cat) {
      let categoryUrlObj = categoryUrl(cat, config.htdocs.category);
      return {
        title: cat,
        url: categoryUrlObj.relativeUrl(),
        urlObj: categoryUrlObj
      };
    });
  } else {
    return [];
  }
};

module.exports = categories;
