'use strict';

/**
 * Translate strings.
 * @constructor
 */
var Translations = function (language) {
  // TODO: Move languages to separate files
  this.translations = {
    en: {
      'index': 'Home',
      'page': 'Page %d/%d',
      'author': 'Articles written by %s',
      'tag': 'Articles with tag "%s"'
    },
    de: {
      'index': 'Startseite',
      'page': 'Seite %d/%d',
      'author': 'Artikel von %s',
      'tag': 'Artikel mit dem Tag "%s"'
    },
    fr: {
      'index': 'Page d\'accueil',
      'page': 'Page %d/%d',
      'author': 'Articles écrits par %s',
      'tag': 'Articles avec le tag "%s"'
    },
    es: {
      'index': 'Portada',
      'page': 'Página %d/%d',
      'author': 'Artículos escritos por %s',
      'tag': 'Artículos con la etiqueta "%s"'
    },
    ru: {
      'index': 'Главная страница',
      'page': 'Страница %d/%d',
      'author': 'Статьи, написанные %s',
      'tag': 'Статьи с тегом "%s"'
    }
  };

  if (!this.translations[language]) {
    throw new Error("Missing locale "+language);
  }

  this.language = language;
  this.currentLanguage = this.translations[language];

  return this;
};

/**
 * [availableLanguageCodes description]
 * @return {[type]} [description]
 */
Translations.prototype.availableLanguageCodes = function() {
  return Object.keys(this.translations);
};

/**
 * [getAll description]
 * @return {[type]} [description]
 */
Translations.prototype.getAll = function() {
  return this.currentLanguage;
};

/**
 * [getString description]
 * @param  {[type]} key [description]
 * @return {[type]}     [description]
 */
Translations.prototype.getString = function(key) {
    if (!this.currentLanguage[key]) {
      throw new Error("Missing string key "+key+" in locale "+this.language);
    }
    return this.currentLanguage[key];
};

module.exports = Translations;
