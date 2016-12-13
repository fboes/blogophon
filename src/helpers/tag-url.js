var url         = require('../helpers/url');
var SuperString = require('../helpers/super-string');

/**
 * [tagUrl description]
 * @param {[type]} identifier [description]
 */
var tagUrl = function (identifier, path) {
  'use strict';
  var external = url(identifier);
  external.path = path || 'tagged';

  external.convert = function (base, type) {
    base = base || 'index';
    type = type || 'html';
    return !this.identifier ? null : external.path + '/' + SuperString(this.identifier).asciify() + '/' + base + '.' + type;
  };

  return external;
};

module.exports = tagUrl;
