'use strict';

var path           = require('path');
var SuperString    = require('../helpers/super-string');
var config         = require('../config');

/**
 * [url description]
 * @constructor
 * @param  {String} identifier [description]
 * @return {url}    [description]
 */
var url = function(identifier) {
  var external = {};

  external.identifier = identifier ? identifier.replace(/^\/+/, '') : null;

  /**
   * [convert description]
   * @param  {String} base Filename of file
   * @param  {String} type File type
   * @return {String}      [description]
   */
  external.convert = function(base, type) {
    base = base || 'index';
    type = type || 'html';
    return !external.identifier ? null : SuperString(external.identifier).asciify() + '/' + base + '.' + type;
  };

  /**
   * [relativeUrl description]
   * @param  {String} base Filename of file
   * @param  {String} type File type
   * @return {String} [description]
   */
  external.relativeUrl = function(base, type) {
    var url = external.convert(base, type);
    return !url ? null : config.basePath + url.replace(/\/index\.html$/, '/');
  };

  /**
   * [absoluteUrl description]
   * @param  {String} base Filename of file
   * @param  {String} type File type
   * @return {String} [description]
   */
  external.absoluteUrl = function(base, type) {
    var url = external.relativeUrl(base, type);
    return !url ? null : config.baseUrl + url;
  };

  /**
   * [absoluteUrlDirname description]
   * @return {String} [description]
   */
  external.absoluteUrlDirname = function() {
    var url = external.absoluteUrl();
    return !url ? null : path.dirname(url + '-');
  };

  /**
   * [filename description]
   * @param  {String} base Filename of file
   * @param  {String} type File type
   * @return {String} [description]
   */
  external.filename = function(base, type) {
    var url = external.relativeFilename(base, type);
    return !url ? null : path.join(config.directories.htdocs, url);
  };

  /**
   * [dirname description]
   * @return {String} [description]
   */
  external.dirname = function() {
    var url = external.filename();
    return !url ? null : path.dirname(url);
  };

  /**
   * [relativeFilename description]
   * @param  {[type]} base [description]
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  external.relativeFilename = function(base, type) {
    var url = external.convert(base, type);
    return !url ? null : url.replace(/(\/)$/, '$1index.html');
  };

  /**
   * [relativeDirname description]
   * @param  {[type]} base [description]
   * @param  {[type]} type [description]
   * @return {[type]}      [description]
   */
  external.relativeDirname = function(base, type) {
    var url = external.relativeFilename(base, type);
    return !url ? null : path.dirname(url);
  };

  /**
   * [toString description]
   * @return {String} [description]
   */
  external.toString = function() {
    return external.identifier;
  };

  return external;
};

module.exports = url;
