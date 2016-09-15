'use strict';

var SuperString    = require('../helpers/super-string');
var config         = require('../config');
var path           = require('path');

/**
 * [Url description]
 * @param  {String} identifier [description]
 * @return {Url}    [description]
 */
var Url = function (identifier) {
  this.identifier = identifier? identifier.replace(/^\/+/, '') : null;
  return this;
};

/**
 * [convert description]
 * @return {String} [description]
 */
Url.prototype.convert = function () {
  return !this.identifier ? null : new SuperString(this.identifier).asciify() + '/index.html';
};

/**
 * [relativeUrl description]
 * @return {String} [description]
 */
Url.prototype.relativeUrl = function () {
  var url = this.convert();
  return !url ? null : config.basePath + url.replace(/\/index\.html$/, '/');
};

/**
 * [absoluteUrl description]
 * @return {String} [description]
 */
Url.prototype.absoluteUrl = function () {
  var url = this.relativeUrl();
  return !url ? null : config.baseUrl + url;
};

/**
 * [absoluteUrlDirname description]
 * @return {String} [description]
 */
Url.prototype.absoluteUrlDirname = function () {
  var url = this.absoluteUrl();
  return !url ? null : path.dirname(url + '-');
};

/**
 * [filename description]
 * @return {String} [description]
 */
Url.prototype.filename = function () {
  var url = this.relativeUrl();
  return !url ? null : path.join(process.cwd(), config.directories.htdocs, url.replace(/(\/)$/, '$1index.html'));
};

/**
 * [dirname description]
 * @return {String} [description]
 */
Url.prototype.dirname = function () {
  var url = this.filename();
  return !url ? null : path.dirname(url);
};

/**
 * [toString description]
 * @return {String} [description]
 */
Url.prototype.toString = function() {
  return this.identifier;
};

module.exports = Url;
