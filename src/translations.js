'use strict';

var Translations = function ( language ) {
  var translations = {
    en: {
      'index': 'Homepage',
      'page': 'Page %d/%d',
      'tag': 'Articles with tag "%s"'
    },
    de: {
      'index': 'Startseite',
      'page': 'Seite %d/%d',
      'tag': 'Artikel mit dem Tag "%s"'
    },
    fr: {},
    es: {},
    ru: {}
  }

  if (!translations[language]) {
    throw new Error("Missing locale "+language);
  }

  var currentLanguage = translations[language];

  return {
    getAll: function() {
      return currentLanguage;
    },
    getString: function(key) {
        if (!currentLanguage[key]) {
          throw new Error("Missing string key "+key+" in locale "+language);
        }
        return currentLanguage[key];
    }
  }

};

module.exports = Translations;
