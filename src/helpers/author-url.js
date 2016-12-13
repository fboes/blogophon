var url         = require('../helpers/url');
var SuperString = require('../helpers/super-string');

/**
 * [authorUrl description]
 * @param {[type]} identifier [description]
 */
var authorUrl = function (identifier, path) {
  'use strict';
  var external = url(identifier);
  external.path = path || 'authored-by';

  external.convert = function (base, type) {
    base = base || 'index';
    type = type || 'html';
    return !external.identifier ? null : external.path + '/' + SuperString(external.identifier).asciify() + '/' + base + '.' + type;
  };
  return external;
};



module.exports = authorUrl;
