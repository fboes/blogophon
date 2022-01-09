import Url from '../helpers/url.js';

class IndexUrl extends Url {
  convert(base, type) {
    base = base || 'index';
    type = type || 'html';
    if (!this.identifier) {
      return null;
    }
    let u = this.identifier.trim().toLowerCase().replace(/\s/g, '');
    if (base !== 'index') {
      u = u.replace(/(^|\/)index/, '$1' + base);
    }
    if (type !== 'html') {
      u = u.replace(/\.html$/, '.' + type);
    }
    return u;
  }
}

export default IndexUrl;
