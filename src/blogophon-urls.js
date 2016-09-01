'use strict';

var config         = require('./config');
var toolshed       = require('./js-toolshed/src/js-toolshed');

/**
 * Converts filenames into URLs, absolute URLs, filenames etc.
 * @constructor
 */
var BlogophonUrls = {
  /**
   * Convert filename of post into URL of post.
   * @param  {String} filename [description]
   * @return {String}          [description]
   */
  getUrlOfPost: function (filename) {
    return !filename ? null : config.basePath + 'posts/' + filename.replace(/\.[^\.]+$/,'').replace(/.+\//,'').asciify() + '/';
  },
  /**
   * Convert filename of index file into URL of index file.
   * @param  {String} filename [description]
   * @return {String}          [description]
   */
  getUrlOfIndex: function (filename) {
    return !filename ? null : config.basePath + filename.trim().toLowerCase().replace(/\s/g, '').replace(/^index\.html$/, '');
  },
  /**
   * Convert tag into URL of tag.
   * @param  {String} tag [description]
   * @return {String}     [description]
   */
  getUrlOfTagged: function (tag) {
    return !tag ? null : config.basePath + 'tagged/' + tag.asciify() + '/';
  },
  /**
   * Convert author name into URL of author.
   * @param  {String} name [description]
   * @return {String}      [description]
   */
  getUrlOfAuthor: function (name) {
    return !name ? null : config.basePath + 'authored-by/' + name.asciify() + '/';
  },
  /**
   * Converts any URL into an absolute URL.
   * @param  {String} url [description]
   * @return {String}     [description]
   */
  getAbsoluteUrlOfUrl: function (url) {
    return !url ? null : config.baseUrl + url;
  },
  /**
   * Converts URL into corresponding filename.
   * @param  {String} url [description]
   * @return {String}     [description]
   */
  getFileOfUrl: function (url) {
    return !url ? null : process.cwd() + '/' + config.directories.htdocs + url.replace(/(\/)$/, '$1index.html');
  },
  /**
   * Convert filename of post into its absolute URL.
   * @param  {String} filename [description]
   * @return {String}          [description]
   */
  getAbsoluteUrlOfPost: function(filename) {
    return BlogophonUrls.getAbsoluteUrlOfUrl(BlogophonUrls.getUrlOfPost(filename));
  },
  /**
   * Converts post URL into filename.
   * @param  {String} filename [description]
   * @return {String}          [description]
   */
  getFileOfPost: function(filename) {
    return BlogophonUrls.getFileOfUrl(BlogophonUrls.getUrlOfPost(filename));
  },
  /**
   * Convert filename of index into its absolute URL.
   * @param  {String} filename [description]
   * @return {String}          [description]
   */
  getAbsoluteUrlOfIndex: function(filename) {
    return BlogophonUrls.getAbsoluteUrlOfUrl(BlogophonUrls.getUrlOfIndex(filename));
  },
  /**
   * Converts index URL into filename.
   * @param  {String} url [description]
   * @return {String}     [description]
   */
  getFileOfIndex: function(url) {
    return BlogophonUrls.getFileOfUrl(BlogophonUrls.getUrlOfIndex(url));
  },
  /**
   * Convert filename of tag into its absolute URL.
   * @param  {String} tag [description]
   * @return {String}     [description]
   */
  getAbsoluteUrlOfTagged: function(tag) {
    return BlogophonUrls.getAbsoluteUrlOfUrl(BlogophonUrls.getUrlOfTagged(tag));
  },
  /**
   * Converts tag URL into filename.
   * @param  {String} url [description]
   * @return {String}     [description]
   */
  getFileOfTagged: function(url) {
    return BlogophonUrls.getFileOfUrl(BlogophonUrls.getUrlOfTagged(url));
  },
  /**
   * Convert author name into his/her absolute URL.
   * @param  {String} name [description]
   * @return {String}      [description]
   */
  getAbsoluteUrlOfAuthor: function(name) {
    return exports.getAbsoluteUrlOfUrl(exports.getUrlOfAuthor(name));
  },
  /**
   * Converts author name into filename.
   * @param  {String} name [description]
   * @return {String}      [description]
   */
  getFileOfAuthor: function(name) {
    return exports.getFileOfUrl(exports.getUrlOfAuthor(name));
  }
};

module.exports = BlogophonUrls;
