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
   * Add url-encoded parameters to first string
   * @param  {String} html  [description]
   * @param  {String} url   [description]
   * @param  {String} title [description]
   * @return {String}       [description]
   */
  trackReplace: trackReplace,

  /**
   * Output a Date object with the given date formats.
   *
   * - locale: Requires extra locale string
   * - iso: Returns an ISO 8601 formatted date / time
   * - rfc: Returns an RFC 2822 formatted date / time
   * - ics: Required for ICS date / time
   * - icsDay: Required for ICS date
   * - timestamp: Returns a timestamp in seconds
   *
   * @param  {Date}   date   [description]
   * @param  {String} format see https://github.com/felixge/node-dateformat and
   *                         the above list of additional formats
   * @param  {String} locale like 'en', 'de'
   * @return {String}        [description]
   */
  dateFormat: blogophonDateFormat
};

module.exports = blogophonHandlebarsQuoters;
