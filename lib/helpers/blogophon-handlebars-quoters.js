'use strict';

const superString  = require('../helpers/super-string');
const trackReplace = require('../helpers/track-replace');

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
  },

  /**
   * Remove any special characters from string and convert into lowercase.
   * @param  {String} text [description]
   * @return {String}      [description]
   */
  asciify: function(text) {
    return superString(text).asciify();
  },

  /**
   * Shorten string to a given maxChars length, using replaceString if it has
   * to be shortened.
   * @param  {String} text          [description]
   * @param  {Number} maxChars      [description]
   * @param  {String} replaceString [description]
   * @return {String}               [description]
   */
  niceShorten: function(text, maxChars = 160, replaceString = '...') {
    return superString(text).niceShorten(maxChars, replaceString);
  },

  /**
   * @see https://stackoverflow.com/questions/34252817/handlebarsjs-check-if-a-string-is-equal-to-a-value
   * @param  {String}  arg1    [description]
   * @param  {String}  arg2    [description]
   * @param  {Object}  options [description]
   * @return {Boolean}         [description]
   */
  ifEquals: function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
  }
};

module.exports = blogophonHandlebarsQuoters;
