'use strict';

/**
 * Translate strings.
 * @constructor
 * @param  {String} language [description]
 * @return {Object}          [description]
 */
var translations = function(language) {
  // TODO: Move languages to separate files
  var external = {};
  external.translations = {
    de: {
      'Home': 'Startseite',
      'Page %d/%d': 'Seite %d/%d',
      'Articles written by %s': 'Artikel von %s',
      'Articles with tag "%s"': 'Artikel mit dem Tag "%s"'
    },
    fr: {
      'Home': 'Page d\'accueil',
      'Page %d/%d': 'Page %d/%d',
      'Articles written by %s': 'Articles écrits par %s',
      'Articles with tag "%s"': 'Articles avec le tag "%s"'
    },
    es: {
      'Home': 'Portada',
      'Page %d/%d': 'Página %d/%d',
      'Articles written by %s': 'Artículos escritos por %s',
      'Articles with tag "%s"': 'Artículos con la etiqueta "%s"'
    },
    ru: {
      'Home': 'Главная страница',
      'Page %d/%d': 'Страница %d/%d',
      'Articles written by %s': 'Статьи, написанные %s',
      'Articles with tag "%s"': 'Статьи с тегом "%s"'
    }
  };

  if (language !== 'en' && !external.translations[language]) {
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
    return (!external.currentLanguage || !external.currentLanguage[key]) ? key : external.currentLanguage[key];
  };

  return external;

};

module.exports = translations;
