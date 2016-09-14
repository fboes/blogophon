'use strict';

var config         = require('../config');
var toolshed       = require('../helpers/js-toolshed');
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
  return !this.identifier ? null : this.identifier.asciify() + '/index.html';
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

module.exports = Url;
