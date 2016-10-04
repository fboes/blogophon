'use strict';

var url         = require('../helpers/url');
var SuperString = require('../helpers/super-string');

/**
 * [authorUrl description]
 * @param {[type]} identifier [description]
 */
var authorUrl = function (identifier) {
  var external = url(identifier);
  external.convert = function (base, type) {
    base = base || 'index';
    type = type || 'html';
    return !external.identifier ? null : 'authored-by/' + new SuperString(external.identifier).asciify() + '/' + base + '.' + type;
  };
  return external;
};



module.exports = authorUrl;
