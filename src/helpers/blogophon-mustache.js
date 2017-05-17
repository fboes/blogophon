'use strict';

/**
 * This adds additonal functionality to Mustache.
 */
var Mustache       = require('mustache');
var fs             = require('fs');
var path           = require('path');
var MustacheQuoters= require('./blogophon-mustache-quoters');

/**
 * Get theme templates and load them into Mustache.themeTemplates
 * @param  {String}  themePath [description]
 * @return {Boolean}           [description]
 */
Mustache.getThemeTemplates = function(themePath) {
  Mustache.themePath =      themePath;
  Mustache.themeTemplates = Mustache.getTemplateObject(Mustache.themePath);
  Mustache.themePartials =  Mustache.getTemplateObject(path.join(Mustache.themePath, 'partials'));
  return true;
};

/**
 * Get internal templates and load them into Mustache.templates
 * @return {Boolean} [description]
 */
Mustache.getTemplates = function() {
  Mustache.templates = Mustache.getTemplateObject(path.join(__dirname, '..', 'templates'));
  return true;
};

/**
 * Read an entire directory, load all files into an object
 * @param  {String} directory [description]
 * @return {Object}           [description]
 */
Mustache.getTemplateObject = function(directory) {
  var templateObject = {};
  fs
    .readdirSync(directory)
    .forEach(function(filename) {
      var absFile = path.join(directory, filename);
      if (fs.statSync(absFile).isFile()){
        var key = filename
          .replace(/^[^a-zA-Z0-9]/g, '')
          .replace(/[^a-zA-Z0-9]/g, ' ')
          .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
          }).replace(/\s+/g, '')
        ;
        templateObject[key] = fs.readFileSync(absFile, 'utf8');
      }
    })
  ;
  return templateObject;
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

/**
 * Add standard quoters to Mustache.render
 * @param  {String} template [description]
 * @param  {Object} view     [description]
 * @param  {Object} partials [description]
 * @return {String}          [description]
 */
Mustache.renderExtra = function(template, view, partials) {
  for (var key in MustacheQuoters) {
    if (!view[key]) {
      view[key] = MustacheQuoters[key];
    }
  }
  return Mustache.render(template, view, partials);
};

module.exports = Mustache;
