'use strict';

var Url       = require('../helpers/url');

/**
 * [IndexUrl description]
 * @param {[type]} identifier [description]
 */
var IndexUrl = function (identifier) {
  Url.call(this, identifier);
  return this;
};
IndexUrl.prototype = Object.create(Url.prototype);
IndexUrl.prototype.constructor = IndexUrl;
IndexUrl.prototype.convert = function (base, type) {
  base = base || 'index';
  type = type || 'html';
  if (!this.identifier) {
    return null;
  } else {
    var u = this.identifier.trim().toLowerCase().replace(/\s/g, '');
    if (base !== 'index') {
      u = u.replace(/\/index/, '/' + base);
    }
    if (type !== 'html') {
      u = u.replace(/\.html$/, '.' + type);
    }
    return u;
  }
};

module.exports = IndexUrl;
