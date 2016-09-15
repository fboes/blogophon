'use strict';

var Url         = require('../helpers/url');
var SuperString = require('../helpers/super-string');

/**
 * [PostUrl description]
 * @param {[type]} identifier [description]
 */
var PostUrl = function (identifier) {
  Url.call(this, identifier);
  return this;
};
PostUrl.prototype = Object.create(Url.prototype);
PostUrl.prototype.constructor = PostUrl;
PostUrl.prototype.convert = function () {
  return !this.identifier ? null : 'posts/' + new SuperString(this.identifier.replace(/\.[^\.]+$/,'').replace(/.+\//,'')).asciify() + '/index.html';
};

module.exports = PostUrl;
