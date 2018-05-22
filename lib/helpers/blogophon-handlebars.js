'use strict';

/**
 * This adds additonal functionality to Handlebars.
 */
const Handlebars     = require('handlebars');
const fs             = require('fs');
const path           = require('path');
const HandlebarsQuoters = require('./blogophon-handlebars-quoters');

/**
 * Get theme templates and load them into Handlebars.themeTemplates
 * @param  {String}  themePath [description]
 * @return {Boolean}           [description]
 */
Handlebars.getThemeTemplates = function(themePath) {
  Handlebars.themePath =      themePath;
  Handlebars.themeTemplates = Handlebars.getTemplateObject(Handlebars.themePath);
  Handlebars.themePartials =  Handlebars.getTemplateObject(path.join(Handlebars.themePath, 'partials'));
  return true;
};

/**
 * Get internal templates and load them into Handlebars.templates
 * @return {Boolean} [description]
 */
Handlebars.getTemplates = function() {
  Handlebars.templates = Handlebars.getTemplateObject(path.join(__dirname, '..', 'templates'));
  return true;
};

/**
 * Read an entire directory, load all files into an object.
 * Also load all helpers.
 * @param  {String} directory [description]
 * @return {Object}           [description]
 */
Handlebars.getTemplateObject = function(directory) {
  let templateObject = {};
  fs
    .readdirSync(directory)
    .forEach(function(filename) {
      let absFile = path.join(directory, filename);
      if (fs.statSync(absFile).isFile()){
        let key = filename
          .replace(/^[^a-zA-Z0-9]/g, '')
          .replace(/[^a-zA-Z0-9]/g, ' ')
          .replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
            return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
          }).replace(/\s+/g, '')
        ;
        templateObject[key] = Handlebars.compile(fs.readFileSync(absFile, 'utf8'));
      }
    })
  ;

  for (let quoterKey in HandlebarsQuoters) {
    Handlebars.registerHelper(quoterKey, HandlebarsQuoters[quoterKey]);
  }

  return templateObject;
};

/**
 * Add partials if present.
 * @param  {Object} template as build by `Handlebars.compile`
 * @param  {Object} view     [description]
 * @param  {Object} partials [description]
 * @return {String}          [description]
 */
Handlebars.compileExtra = function(template, view, partials) {
  for (let partialKey in partials) {
    Handlebars.registerPartial(partialKey, partials[partialKey]);
  }
  return template(view);
};

module.exports = Handlebars;
