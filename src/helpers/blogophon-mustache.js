'use strict';

/**
 * This adds additonal functionality to Mustache.
 */
var Mustache       = require('mustache');
var fs             = require('fs');
var path           = require('path');

/**
 * Load all templates from themes folder. Prime `this.templates` and `this.partials`.
 * @param  {String} themePath [description]
 * @return {Mustache}    [description]
 */
Mustache.getTemplates = function(themePath) {
  Mustache.themePath = themePath;
  Mustache.templates = {
    post:     fs.readFileSync(path.join(Mustache.themePath, '/post.html'), 'utf8'),
    amp:      fs.readFileSync(path.join(Mustache.themePath, '/amp-post.html'), 'utf8'),
    index:    fs.readFileSync(path.join(Mustache.themePath, '/index.html'), 'utf8'),
    tags:     fs.readFileSync(path.join(Mustache.themePath, '/tags.html'), 'utf8'),
    authors:  fs.readFileSync(path.join(Mustache.themePath, '/authors.html'), 'utf8'),
    four:     fs.readFileSync(path.join(Mustache.themePath, '/404.html'), 'utf8'),
    rss:      fs.readFileSync(path.join(__dirname, '/../templates/rss.xml'), 'utf8'),
    atom:     fs.readFileSync(path.join(__dirname, '/../templates/atom.xml'), 'utf8'),
    sitemap:  fs.readFileSync(path.join(__dirname, '/../templates/sitemap.xml'), 'utf8'),
    robots:   fs.readFileSync(path.join(__dirname, '/../templates/robots.txt'), 'utf8'),
    htaccess: fs.readFileSync(path.join(__dirname, '/../templates/.htaccess'), 'utf8'),
    livetile: fs.readFileSync(path.join(__dirname, '/../templates/livetile.xml'), 'utf8'),
    calendar: fs.readFileSync(path.join(__dirname, '/../templates/calendar.ics'), 'utf8'),
    networkKml:    fs.readFileSync(path.join(__dirname, '/../templates/network.kml'), 'utf8'),
    placesKml:     fs.readFileSync(path.join(__dirname, '/../templates/places.kml'), 'utf8'),
    opensearch:    fs.readFileSync(path.join(__dirname, '/../templates/opensearch.xml'), 'utf8'),
    browserconfig: fs.readFileSync(path.join(__dirname, '/../templates/browserconfig.xml'), 'utf8')
  };

  Mustache.partials = {};
  fs.readdirSync(path.join(Mustache.themePath, '/partials')).forEach(function(file){
    Mustache.partials[file.replace(/\.[a-z]+$/, '')] = fs.readFileSync(path.join(Mustache.themePath, '/partials/'+file), 'utf8');
  });

  for (var t in Mustache.templates) {
    Mustache.parse(t);
  }
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
