'use strict';

var Url         = require('../helpers/url');
var SuperString = require('../helpers/super-string');

/**
 * [PostUrl description]
 * @param {[type]} identifier [description]
 */
var PostUrl = function (identifier, path) {
  this.path = path || 'posts';
  Url.call(this, identifier);
  return this;
};
PostUrl.prototype = Object.create(Url.prototype);
PostUrl.prototype.constructor = PostUrl;
PostUrl.prototype.convert = function (base, type) {
  base = base || 'index';
  type = type || 'html';
  return !this.identifier ? null : this.path + '/' + new SuperString(this.identifier.replace(/\.[^\.]+$/,'').replace(/.+\//,'')).asciify() + '/' + base + '.' + type;
};

module.exports = PostUrl;
