'use strict';

var Url       = require('../helpers/url');

/**
 * [AuthorUrl description]
 * @param {[type]} identifier [description]
 */
var AuthorUrl = function (identifier) {
  Url.call(this, identifier);
  return this;
};
AuthorUrl.prototype = Object.create(Url.prototype);
AuthorUrl.prototype.constructor = AuthorUrl;
AuthorUrl.prototype.convert = function () {
  return !this.identifier ? null : 'authored-by/' + this.identifier.asciify() + '/index.html';
};

module.exports = AuthorUrl;
