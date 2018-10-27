'use strict';

// Blogophon internal
const categoryUrl    = require('../helpers/category-url');

const categories = function(config) {
  if (config.categories) {
    return config.categories.map(function(cat) {
      const categoryUrlObj = categoryUrl(cat, config.htdocs.category);
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
