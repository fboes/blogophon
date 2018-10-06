'use strict';

const dateFormat      = require('dateformat');

/**
 * Output a Date object with the given date formats.
 *
 * - locale: Requires extra locale string
 * - iso: Returns an ISO 8601 / RFC 3339 formatted date / time
 * - rfc: Returns an RFC 2822 formatted date / time
 * - ics: Required for UTC ICS date / time
 * - icsDay: Required for ICS date
 * - timestamp: Returns a timestamp in seconds
 *
 * @see    https://en.wikipedia.org/wiki/Date_format_by_country
 * @param  {Date}   date   [description]
 * @param  {String} format see https://github.com/felixge/node-dateformat and
 *                         the above list of additional formats
 * @param  {String} locale like 'en', 'de', 'de-DE'
 * @return {String}        [description]
 */
const blogophonDateFormat = function(date, format, locale = 'de') {
  let localeArray = [];
  date = new Date(date);
  switch(format) {
    case 'locale':
      localeArray = locale.split('-');
      switch (localeArray[0]) {
        case 'de':
        case 'ru':
          format = 'dd.mm.yyyy';
          break;
        case 'fr':
          format = 'dd-mm-yyyy';
          break;
        case 'es':
          format = 'dd/mm/yyyy';
          break;
        case 'en':
          format = (localeArray[1] && localeArray[1] === 'US')
            ? 'mm/dd/yyyy'
            : 'dd/mm/yyyy'
          ;
          break;
        default:
          format = 'yyyy-mm-dd';
          break;
      }
      break;
    case 'iso':
    case 'iso8601':
    case 'rfc3339':
      format = 'isoDateTime'; // 2007-06-09T17:46:21+0200
      break;
    case 'rfc':
    case 'rfc2822':
      format = 'ddd, dd mmm yyyy HH:MM:ss o'; // Wed, 02 Oct 2002 15:00:00 +0200
      break;
    case 'ics':
      format = "UTC:yyyymmdd'T'HHMMss'Z'"; // 20161013T062047
      break;
    case 'icsDay':
      format = 'yyyymmdd'; // 20161013
      break;
    case 'timestamp':
      return Math.round(date.getTime() / 1000);
  }

  let formattedDate = dateFormat(date, format);
  if (format === 'isoDateTime') {
    formattedDate = formattedDate.replace(/(\d{2})(\d{2})$/, '$1:$2'); // 2007-06-09T17:46:21+02:00
  }
  return formattedDate;
};

module.exports = blogophonDateFormat;
