import CategoryUrl from '../helpers/category-url.js';

const categories = function(config) {
  if (config.categories) {
    return config.categories.map(function(cat) {
      const categoryUrlObj = new CategoryUrl(cat, config.htdocs.category);
      return {
        title: cat,
        url: categoryUrlObj.relativeUrl(),
        urlObj: categoryUrlObj
      };
    });
  }
  return [];

};

export default categories;
