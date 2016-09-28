'use strict';

var Url         = require('../helpers/url');
var SuperString = require('../helpers/super-string');

/**
 * [TagUrl description]
 * @param {[type]} identifier [description]
 */
var TagUrl = function (identifier) {
  Url.call(this, identifier);
  return this;
};
TagUrl.prototype = Object.create(Url.prototype);
TagUrl.prototype.constructor = TagUrl;
TagUrl.prototype.convert = function (base, type) {
  base = base || 'index';
  type = type || 'html';
  return !this.identifier ? null : 'tagged/' + new SuperString(this.identifier).asciify() + '/' + base + '.' + type;
};

module.exports = TagUrl;
