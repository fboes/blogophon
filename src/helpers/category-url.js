'use strict';

let url         = require('../helpers/url');
let SuperString = require('../helpers/super-string');

/**
 * [categoryUrl description]
 * @param  {String} identifier [description]
 * @param  {String} path       [description]
 * @return {Object}            [description]
 */
let categoryUrl = function(identifier, path) {
  let external = url(identifier);
  external.path = path || 'category';

  external.convert = function(base, type) {
    base = base || 'index';
    type = type || 'html';
    return !this.identifier ? null : external.path + '/' + SuperString(this.identifier).asciify() + '/' + base + '.' + type;
  };

  return external;
};

module.exports = categoryUrl;
