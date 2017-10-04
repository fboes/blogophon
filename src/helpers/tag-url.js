'use strict';

const url         = require('../helpers/url');
const SuperString = require('../helpers/super-string');

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

module.exports = tagUrl;
