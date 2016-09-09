'use strict';

var Url       = require('../helpers/url');

/**
 * [IndexUrl description]
 * @param {[type]} identifier [description]
 */
function IndexUrl(identifier) {
  Url.call(this, identifier);
  return this;
}
IndexUrl.prototype = Object.create(Url.prototype);
IndexUrl.prototype.constructor = IndexUrl;
IndexUrl.prototype.convert = function () {
  return !this.identifier ? null : this.identifier.trim().toLowerCase().replace(/\s/g, '');
};

module.exports = IndexUrl;
