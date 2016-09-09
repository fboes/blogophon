'use strict';

var config         = require('../config');
var toolshed       = require('../helpers/js-toolshed');
var path           = require('path');

/**
 * [Url description]
 * @param {[type]} identifier [description]
 */
function Url (identifier) {
  this.identifier = identifier;
  return this;
}
Url.prototype.convert = function () {
  return !this.identifier ? null : this.identifier.asciify() + '/index.html';
};
Url.prototype.relativeUrl = function () {
  var url = this.convert();
  return !url ? null : config.basePath + url.replace(/\/index\.html$/, '/');
};
Url.prototype.absoluteUrl = function () {
  var url = this.relativeUrl();
  return !url ? null : config.baseUrl + url;
};
Url.prototype.filename = function () {
  var url = this.relativeUrl();
  return !url ? null : process.cwd() + '/' + config.directories.htdocs + url.replace(/(\/)$/, '$1index.html');
};
Url.prototype.dirname = function () {
  var url = this.filename();
  return !url ? null : path.dirname(url);
};

module.exports = Url;
