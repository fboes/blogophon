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
  this.identifier = identifier ? identifier.replace(/^\/+/, '') : null;
  return this;
};

/**
 * [convert description]
 * @params {String} base Filename of file
 * @params {String} type File type
 * @return {String} [description]
 */
Url.prototype.convert = function (base, type) {
  base = base || 'index';
  type = type || 'html';
  return !this.identifier ? null : new SuperString(this.identifier).asciify() + '/' + base + '.' + type;
};

/**
 * [relativeUrl description]
 * @params {String} base Filename of file
 * @params {String} type File type
 * @return {String} [description]
 */
Url.prototype.relativeUrl = function (base, type) {
  var url = this.convert(base, type);
  return !url ? null : config.basePath + url.replace(/\/index\.html$/, '/');
};

/**
 * [absoluteUrl description]
 * @params {String} base Filename of file
 * @params {String} type File type
 * @return {String} [description]
 */
Url.prototype.absoluteUrl = function (base, type) {
  var url = this.relativeUrl(base, type);
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
 * @params {String} base Filename of file
 * @params {String} type File type
 * @return {String} [description]
 */
Url.prototype.filename = function (base, type) {
  var url = this.relativeUrl(base, type);
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
