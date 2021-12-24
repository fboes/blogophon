
// Blogophon internal
import url from '../helpers/url.js';
import SuperString from '../helpers/super-string.js';

/**
 * [postUrl description]
 * @param  {String} identifier [description]
 * @param  {String} path       [description]
 * @return {Object}            [description]
 */
const postUrl = function(identifier, path) {
  const external = url(identifier);
  external.path = path || 'posts';

  external.convert = function(base, type) {
    base = base || 'index';
    type = type || 'html';

    if (!external.identifier) {
      return null;
    }

    return external.path
      + '/'
      + SuperString(external.identifier.replace(/([\\/]index)?\.md$/, '').replace(/.+[\\/]/, '')).asciify()
      + '/'
      + base + '.' + type
    ;
  };

  return external;
};

export default postUrl;
