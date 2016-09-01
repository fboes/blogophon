'use strict';

var dateFormat      = require('dateformat');

/**
 * Returns RSS as a javascript object.
 * @constructor
 */
var BlogophoneDate = function (date, locale) {
  if (!locale) {
    locale = de;
  }
  var localeString = 'dd.mm.yyyy';
  switch (locale) {
    case 'de': localeString = 'dd.mm.yyyy'; break;
    default  : localeString = 'yyyy-mm-dd'; break;
  }
  return {
    locale:    dateFormat(date,localeString),
    iso:       dateFormat(date,'isoDateTime').replace(/(\d{2})(\d{2})$/,'$1:$2'),
    rfc:       dateFormat(date,'ddd, dd mmm yyyy hh:MM:ss o'), // Wed, 02 Oct 2002 15:00:00 +0200
    timestamp: Math.round(new Date(date).getTime() / 1000)
  };
};

module.exports = BlogophoneDate;
