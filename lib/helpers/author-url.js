'use strict';

const url         = require('../helpers/url');
const SuperString = require('../helpers/super-string');

/**
 * [authorUrl description]
 * @param  {String} identifier [description]
 * @param  {String} path       [description]
 * @return {Object}            [description]
 */
const authorUrl = function(identifier, path) {
  const external = url(identifier);
  external.path = path || 'authored-by';

  external.convert = function(base, type) {
    base = base || 'index';
    type = type || 'html';
    return !external.identifier ? null : external.path + '/' + SuperString(external.identifier).asciify() + '/' + base + '.' + type;
  };
  return external;
};



module.exports = authorUrl;
