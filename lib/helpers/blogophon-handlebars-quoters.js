'use strict';

const blogophonHandlebarsQuoters = {
  icsQuote: function() {
    return function(text) {
      let newText = text
        .replace(/(\n|\r|\r\n)/g, "\\n")
        .replace(/(,|;)/g, '\\$1');
      if (newText.length > 30) {
        newText = newText.match(/[\s\S]{1,72}/g).join("\r\n ");
        newText = "\r\n "+newText;
      }
      return newText;
    };
  },
  ymlQuote: function() {
    return function(text) {
      if (text.match(/['":#{}[\],&*?|<>=!%@`-]/) && !text.match(/^\d[\d:\-+T]+\d$/)) {
        text = "'" + text.replace(/(')/g, '$1$1') + "'";
      }
      return text;
    };
  },
  jsQuote: function() {
    return function(text) {
      return text.replace(/[\n|\r]/g, '\\n').replace(/(')/g, '\\$1');
    };
  },
  noLineBreak: function() {
    return function(text) {
      return text.replace(/\s*[\n|\r]+/g, ' ');
    };
  },
  nl2br: function() {
    return function(text) {
      return text.replace(/[\n|\r]+/g, '<br />$0');
    };
  },
  noNewline: function() {
    return function(text) {
      return text.replace(/[\n|\r]+/g, ' ');
    };
  },
  i18n: function() {
    return function(text) {
      // change text
      return text;
    };
  },
  encodeURIComponent: function() {
    return function(text) {
      return encodeURIComponent(text);
    };
  }
};

module.exports = blogophonHandlebarsQuoters;
