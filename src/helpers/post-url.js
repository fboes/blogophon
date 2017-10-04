'use strict';

const url         = require('../helpers/url');
const SuperString = require('../helpers/super-string');

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
    return !external.identifier ? null : external.path + '/' + SuperString(external.identifier.replace(/\.[^.]+$/, '').replace(/.+\//, '')).asciify() + '/' + base + '.' + type;
  };

  return external;
};

module.exports = postUrl;
