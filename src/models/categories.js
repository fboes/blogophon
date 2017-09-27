'use strict';

var categoryUrl    = require('../helpers/category-url');

var categories = function(config) {
  if (config.categories) {
    return config.categories.map(function(cat) {
      var categoryUrlObj = categoryUrl(cat, config.htdocs.category);
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
