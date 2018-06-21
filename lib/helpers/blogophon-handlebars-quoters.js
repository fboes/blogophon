'use strict';

const trackReplace        = require('../helpers/track-replace');
const blogophonDateFormat = require('../helpers/blogophon-date-format');

/**
 * Defines methods to be used by `Handlebars.registerHelper`
 * @type {Object}
 */
const blogophonHandlebarsQuoters = {
  icsQuote: function(options) {
    let newText = options.fn(this)
      .replace(/(\n|\r|\r\n)/g, "\\n")
      .replace(/(,|;)/g, '\\$1');
    if (newText.length > 30) {
      newText = newText.match(/[\s\S]{1,72}/g).join("\r\n ");
      newText = "\r\n "+newText;
    }
    return newText;
  },
  ymlQuote: function(options) {
    let text = options.fn(this);
    if (text.match(/['":#{}[\],&*?|<>=!%@`-]/) && !text.match(/^\d[\d:\-+T]+\d$/)) {
      text = "'" + text.replace(/(')/g, '$1$1') + "'";
    }
    return text;
  },
  jsQuote: function(options) {
    return options.fn(this).replace(/[\n|\r]/g, '\\n').replace(/(')/g, '\\$1');
  },
  trackReplace: trackReplace,
  dateFormat: blogophonDateFormat,
  noLineBreak: function(options) {
    return options.fn(this).replace(/\s*[\n|\r]+/g, ' ');
  },
  nl2br: function(options) {
    return options.fn(this).replace(/[\n|\r]+/g, '<br />$0');
  },
  noNewline: function(options) {
    return options.fn(this).replace(/[\n|\r]+/g, ' ');
  },
  i18n: function(options) {
    // change text
    return options.fn(this);
  },
  encodeURIComponent: function(options) {
    return encodeURIComponent(options.fn(this));
  }
};

module.exports = blogophonHandlebarsQuoters;
