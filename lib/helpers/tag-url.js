import url from '../helpers/url.js';
import SuperString from '../helpers/super-string.js';

/**
 * [tagUrl description]
 * @param  {String} identifier [description]
 * @param  {String} path       [description]
 * @return {Object}            [description]
 */
const tagUrl = function(identifier, path) {
  const external = url(identifier);
  external.path = path || 'tagged';

  external.convert = function(base, type) {
    base = base || 'index';
    type = type || 'html';
    return !this.identifier ? null : external.path + '/' + SuperString(this.identifier).asciify() + '/' + base + '.' + type;
  };

  return external;
};

export default tagUrl;
