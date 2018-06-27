'use strict';

const dateFormat      = require('dateformat');

/**
 * Returns lots of date formats as a javascript object.
 * @see https://en.wikipedia.org/wiki/Date_format_by_country
 * @constructor
 * @param  {String} date   [description]
 * @param  {String} locale [description]
 * @return {Object}        [description]
 */
const blogophonDate = function(date, locale = 'de') {
  let localeString = 'dd.mm.yyyy';
  switch (locale) {
    case 'de':
    case 'ru':
      localeString = 'dd.mm.yyyy';
      break;
    case 'fr':
      localeString = 'dd-mm-yyyy';
      break;
    case 'es':
    case 'en':
      localeString = 'dd/mm/yyyy';
      break;
    default:
      localeString = 'yyyy-mm-dd';
      break;
  }
  return {
    format: function(format) {
      return dateFormat(date, format);
    },
    locale:    dateFormat(date, localeString),
    iso:       dateFormat(date, 'isoDateTime').replace(/(\d{2})(\d{2})$/, '$1:$2'),
    rfc:       dateFormat(date, 'ddd, dd mmm yyyy HH:MM:ss o'), // Wed, 02 Oct 2002 15:00:00 +0200
    ics:       dateFormat(date, "UTC:yyyymmdd'T'HHMMss'Z'"), // 20161013T062047
    icsDay:    dateFormat(date, 'yyyymmdd'), // 20161013
    timestamp: Math.round(new Date(date).getTime() / 1000),
    year:      dateFormat(date, 'yyyy'),
    month:     dateFormat(date, 'mm'),
    day:       dateFormat(date, 'dd')
  };
};

module.exports = blogophonDate;
