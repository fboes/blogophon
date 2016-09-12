'use strict';

var Url       = require('../helpers/url');

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
TagUrl.prototype.convert = function () {
  return !this.identifier ? null : 'tagged/' + this.identifier.asciify() + '/index.html';
};

module.exports = TagUrl;
