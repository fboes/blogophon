import Url from './Url.js';
import SuperString from './super-string.js';

class PostUrl extends Url {
  /**
   * [postUrl description]
   * @param  {String} identifier [description]
   * @param  {String} path       [description]
   */
  constructor(identifier, path) {
    super(identifier);
    this.path = path || 'posts';
  }

  convert(base, type) {
    base = base || 'index';
    type = type || 'html';

    if (!this.identifier) {
      return null;
    }

    return this.path
      + '/'
      + SuperString(this.identifier.replace(/([\\/]index)?\.md$/, '').replace(/.+[\\/]/, '')).asciify()
      + '/'
      + base + '.' + type
    ;
  }
}

export default PostUrl;
