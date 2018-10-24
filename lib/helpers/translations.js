'use strict';

/**
 * Translate strings.
 * @constructor
 * @param  {String} language [description]
 * @return {Object}          [description]
 */
const translations = function(language) {
  // TODO: Move languages to separate files
  const external = {};
  external.translations = {
    de: {
      'Home': 'Startseite',
      'Home page': 'Startseite',
      'Page %d/%d': 'Seite %d/%d',
      'Articles written by %s': 'Artikel von %s',
      'Articles with tag "%s"': 'Artikel mit dem Tag "%s"',
      'All tags': 'Alle Tags'
    },
    fr: {
      'Home': 'Page d\'accueil',
      'Home page': 'Page d\'accueil',
      'Page %d/%d': 'Page %d/%d',
      'Articles written by %s': 'Articles écrits par %s',
      'Articles with tag "%s"': 'Articles avec le tag "%s"',
      'All tags': 'Tous les tags'
    },
    es: {
      'Home': 'Portada',
      'Home page': 'Portada',
      'Page %d/%d': 'Página %d/%d',
      'Articles written by %s': 'Artículos escritos por %s',
      'Articles with tag "%s"': 'Artículos con la etiqueta "%s"',
      'All tags': 'Todas las etiquetas'
    },
    ru: {
      'Home': 'Главная страница',
      'Home page': 'Главная страница',
      'Page %d/%d': 'Страница %d/%d',
      'Articles written by %s': 'Статьи, написанные %s',
      'Articles with tag "%s"': 'Статьи с тегом "%s"',
      'All tags': 'Все теги'
    }
  };

  const shortLanguage = language.replace(/^([a-zA-Z]+)-.+?$/, '$1');

  if (language !== 'en' && !external.translations[shortLanguage] && !external.translations[language]) {
    throw new Error("Missing locale " + language);
  }

  if (external.translations[language]) {
    external.language = language;
    external.currentLanguage = external.translations[language];
  }

  external.language = shortLanguage;
  external.currentLanguage = external.translations[shortLanguage];

  /**
   * [availableLanguageCodes description]
   * @return {String} [description]
   */
  external.availableLanguageCodes = function() {
    return Object.keys(external.translations);
  };

  /**
   * [getAll description]
   * @return {String} [description]
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
