'use strict';

/**
 * This adds additonal functionality to Handlebars.
 */
const Handlebars     = require('handlebars');
const fs             = require('fs');
const path           = require('path');
const HandlebarsQuoters = require('./blogophon-handlebars-quoters');
const translations   = require('./translations');

/**
 * Get theme templates and load them into Handlebars.themeTemplates
 * @param  {String}  themePath [description]
 * @param  {String}  locale    [description]
 * @return {Boolean}           [description]
 */
Handlebars.getThemeTemplates = function(themePath, locale = 'en') {
  Handlebars.themePath =      themePath;
  Handlebars.themeTemplates = Handlebars.getTemplateObject(Handlebars.themePath, locale);
  Handlebars.themePartials =  Handlebars.getTemplateObject(path.join(Handlebars.themePath, 'partials'), locale);
  return true;
};

/**
 * Get internal templates and load them into Handlebars.templates
 * @param  {String}  locale    [description]
 * @return {Boolean}           [description]
 */
Handlebars.getTemplates = function(locale = 'en') {
  Handlebars.templates = Handlebars.getTemplateObject(path.join(__dirname, '..', 'templates'), locale);
  return true;
};

/**
 * Read an entire directory, load all files into an object.
 * Also load all helpers.
 * @param  {String} directory [description]
 * @param  {String} locale    [description]
 * @return {Object}           [description]
 */
Handlebars.getTemplateObject = function(directory, locale = 'en') {
  const translation  = translations(locale);
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

  Handlebars.registerHelper("i18n", function(options) {
    // change text
    return translation.getString(options.fn(this));
  });

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
