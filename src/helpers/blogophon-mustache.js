'use strict';

/**
 * This adds additonal functionality to Mustache.
 */
var Mustache       = require('mustache');
var fs             = require('fs');

/**
 * [getTemplates description]
 * @param  {[type]} path [description]
 * @return {[type]}      [description]
 */
Mustache.getTemplates = function(path) {
  Mustache.themePath = path;
  Mustache.templates = {
    post:    fs.readFileSync(Mustache.themePath + '/post.html', 'utf8'),
    index:   fs.readFileSync(Mustache.themePath + '/index.html', 'utf8'),
    tags:    fs.readFileSync(Mustache.themePath + '/tags.html', 'utf8'),
    authors: fs.readFileSync(Mustache.themePath + '/authors.html', 'utf8'),
    four:    fs.readFileSync(Mustache.themePath + '/404.html', 'utf8'),
    rss:     fs.readFileSync('./src/templates/rss.xml', 'utf8'),
    atom:    fs.readFileSync('./src/templates/atom.xml', 'utf8'),
    sitemap: fs.readFileSync('./src/templates/sitemap.xml', 'utf8'),
    robots:  fs.readFileSync('./src/templates/robots.txt', 'utf8'),
    htaccess:  fs.readFileSync('./src/templates/.htaccess', 'utf8'),
    livetile:fs.readFileSync('./src/templates/livetile.xml', 'utf8'),
    browserconfig:fs.readFileSync('./src/templates/browserconfig.xml', 'utf8')
  };
  Mustache.partials = {
    meta:       fs.readFileSync(Mustache.themePath + '/partials/meta.html', 'utf8'),
    header:     fs.readFileSync(Mustache.themePath + '/partials/header.html', 'utf8'),
    navigation: fs.readFileSync(Mustache.themePath + '/partials/navigation.html', 'utf8'),
    sidebar:    fs.readFileSync(Mustache.themePath + '/partials/sidebar.html', 'utf8'),
    footer:     fs.readFileSync(Mustache.themePath + '/partials/footer.html', 'utf8'),
    closure:    fs.readFileSync(Mustache.themePath + '/partials/closure.html', 'utf8')
  };
  Object.keys(Mustache.templates).map(function(t) {
    Mustache.parse(t);
  });
  return this;
};

/**
 * New HTML escaping
 * @param  {String} string [description]
 * @return {String}        [description]
 */
Mustache.escape = function(string) {
  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return String(string).replace(/[&<>"']/g, function(s) {
    return entityMap[s];
  });
};

module.exports = Mustache;
