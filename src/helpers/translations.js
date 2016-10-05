'use strict';

/**
 * Translate strings.
 * @constructor
 */
var translations = function (language) {
  // TODO: Move languages to separate files
  var external = {};
  external.translations = {
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

  if (!external.translations[language]) {
    throw new Error("Missing locale "+language);
  }

  external.language = language;
  external.currentLanguage = external.translations[language];


  /**
   * [availableLanguageCodes description]
   * @return {[type]} [description]
   */
  external.availableLanguageCodes = function() {
    return Object.keys(external.translations);
  };

  /**
   * [getAll description]
   * @return {[type]} [description]
   */
  external.getAll = function() {
    return external.currentLanguage;
  };

  /**
   * [getString description]
   * @param  {[type]} key [description]
   * @return {[type]}     [description]
   */
  external.getString = function(key) {
      if (!external.currentLanguage[key]) {
        throw new Error("Missing string key "+key+" in locale "+external.language);
      }
      return external.currentLanguage[key];
  };

  return external;

};

module.exports = translations;
