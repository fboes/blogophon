import Url from '../helpers/url.js';
import SuperString from '../helpers/super-string.js';

class CategoryUrl extends Url {
  /**
   * [categoryUrl description]
   * @param  {String} identifier [description]
   * @param  {String} path       [description]
   */
  constructor(identifier, path) {
    super(identifier);
    this.path = path || 'category';
  }

  convert(base, type) {
    base = base || 'index';
    type = type || 'html';
    return !this.identifier ? null : this.path + '/' + SuperString(this.identifier).asciify() + '/' + base + '.' + type;
  }
}

export default CategoryUrl;
