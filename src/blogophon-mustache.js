'use strict';

var Mustache       = require('mustache');
var config         = require('./config');
var fs             = require('fs-extra');

Mustache.templates = {
  post:    fs.readFileSync(config.directories.currentTheme+'/post.html', 'utf8'),
  index:   fs.readFileSync(config.directories.currentTheme+'/index.html', 'utf8'),
  tags:    fs.readFileSync(config.directories.currentTheme+'/tags.html', 'utf8'),
  four:    fs.readFileSync(config.directories.currentTheme+'/404.html', 'utf8'),
  rss:     fs.readFileSync(config.directories.currentTheme+'/rss.xml', 'utf8'),
  atom:    fs.readFileSync(config.directories.currentTheme+'/atom.xml', 'utf8'),
  sitemap: fs.readFileSync(config.directories.currentTheme+'/sitemap.xml', 'utf8')
};
Mustache.partials = {
  meta:    fs.readFileSync(config.directories.currentTheme+'/partials/meta.html', 'utf8'),
  header:  fs.readFileSync(config.directories.currentTheme+'/partials/header.html', 'utf8'),
  sidebar: fs.readFileSync(config.directories.currentTheme+'/partials/sidebar.html', 'utf8'),
  footer:  fs.readFileSync(config.directories.currentTheme+'/partials/footer.html', 'utf8')
};

Mustache.escape = function (string) {
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(string).replace(/[&<>"']/g, function (s) {
    return entityMap[s];
  });
};

Object.keys(Mustache.templates).map(function (t) {
  Mustache.parse(t);
});

module.exports = Mustache;
