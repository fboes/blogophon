'use strict';

var Url       = require('../helpers/url');

/**
 * [PostUrl description]
 * @param {[type]} identifier [description]
 */
function PostUrl(identifier) {
  Url.call(this, identifier);
  return this;
}
PostUrl.prototype = Object.create(Url.prototype);
PostUrl.prototype.constructor = PostUrl;
PostUrl.prototype.convert = function () {
  return !this.identifier ? null : 'posts/' + this.identifier.replace(/\.[^\.]+$/,'').replace(/.+\//,'').asciify() + '/index.html';
};

module.exports = PostUrl;
