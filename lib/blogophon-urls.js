'use strict';

/**
 * Represents all posts
 * @constructor
 */
var BlogophonUrls = function () {
  var config         = require('./config');
  var toolshed       = require('./js-toolshed/src/js-toolshed');

  var exports = {
    getUrlOfPost: function (filename) {
      return !filename ? null : config.basePath + 'posts/' + filename.replace(/\.[^\.]+$/,'').replace(/.+\//,'').asciify() + '/';
    },
    getUrlOfIndex: function (filename) {
      return !filename ? null : config.basePath + filename.trim().toLowerCase().replace(/\s/g, '').replace(/^index\.html$/, '');
    },
    getUrlOfTagged: function (tag) {
      return !tag ? null : config.basePath + 'tagged/' + tag.asciify() + '/';
    },
    getAbsoluteUrlOfUrl: function (url) {
      return !url ? null : config.baseUrl + url;
    },
    getFileOfUrl: function (url) {
      return !url ? null : process.cwd() + '/' + config.directories.htdocs + url.replace(/(\/)$/, '$1index.html');
    },
    getAbsoluteUrlOfPost: function(x) {
      return exports.getAbsoluteUrlOfUrl(exports.getUrlOfPost(x));
    },
    getFileOfPost: function(x) {
      return exports.getFileOfUrl(exports.getUrlOfPost(x));
    },
    getAbsoluteUrlOfIndex  : function(x) {
      return exports.getAbsoluteUrlOfUrl(exports.getUrlOfIndex(x));
    },
    getFileOfIndex: function(x) {
      return exports.getFileOfUrl(exports.getUrlOfIndex(x));
    },
    getAbsoluteUrlOfTagged: function(x) {
      return exports.getAbsoluteUrlOfUrl(exports.getUrlOfTagged(x));
    },
    getFileOfTagged: function(x) {
      return exports.getFileOfUrl(exports.getUrlOfTagged(x));
    }
  };

  return exports;
};

module.exports = BlogophonUrls;
