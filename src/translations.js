'use strict';

/**
 * Translate strings.
 * @constructor
 */
var Translations = function ( language ) {
  // Todo: Move languages to separate files
  var translations = {
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
      'author': 'Articles de %s',
      'tag': 'Articles avec le tag "%s"'
    },
    es: {
      'index': 'Portada',
      'page': 'Página %d/%d',
      'author': 'Artículos de %s',
      'tag': 'Artículos con la etiqueta "%s"'
    },
    ru: {
      'index': 'Главная страница',
      'page': 'Страница %d/%d',
      'author': '%s',
      'tag': 'Статьи с тегом "%s"'
    }
  };

  if (!translations[language]) {
    throw new Error("Missing locale "+language);
  }

  var currentLanguage = translations[language];

  return {
    /**
     * [availableLanguageCodes description]
     * @return {[type]} [description]
     */
    availableLanguageCodes: function () {
      return Object.keys(translations);
    },
    /**
     * [getAll description]
     * @return {[type]} [description]
     */
    getAll: function() {
      return currentLanguage;
    },
    /**
     * [getString description]
     * @param  {[type]} key [description]
     * @return {[type]}     [description]
     */
    getString: function(key) {
        if (!currentLanguage[key]) {
          throw new Error("Missing string key "+key+" in locale "+language);
        }
        return currentLanguage[key];
    }
  };
};

module.exports = Translations;
