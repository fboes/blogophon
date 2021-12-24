
// Blogophon internal
import url from '../helpers/url.js';

/**
 * [indexUrl description]
 * @param  {String} identifier [description]
 * @return {Object}            [description]
 */
const indexUrl = function(identifier) {
  const external = url(identifier);

  external.convert = function(base, type) {
    base = base || 'index';
    type = type || 'html';
    if (!external.identifier) {
      return null;
    }
    let u = external.identifier.trim().toLowerCase().replace(/\s/g, '');
    if (base !== 'index') {
      u = u.replace(/(^|\/)index/, '$1' + base);
    }
    if (type !== 'html') {
      u = u.replace(/\.html$/, '.' + type);
    }
    return u;

  };
  return external;
};


export default indexUrl;
