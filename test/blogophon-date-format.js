'use strict';

const assert = require('assert');
const blogophonDateFormat = require('../lib/helpers/blogophon-date-format');

describe('Blogophon Date Format', function() {
  const date = '2016-12-31 12:32:52';
  let formattedDate = '';

  it('should convert ISO 8601 dates', function() {
    formattedDate = blogophonDateFormat(date, 'iso');
    assert.equal(formattedDate, '2016-12-31T12:32:52+01:00');
    assert.equal(formattedDate, blogophonDateFormat(date, 'iso8601'));
  });
  it('should convert RFC 2822 dates', function() {
    formattedDate = blogophonDateFormat(date, 'rfc');
    assert.equal(formattedDate, 'Sat, 31 Dec 2016 12:32:52 +0100');
    assert.equal(formattedDate, blogophonDateFormat(date, 'rfc2822'));
  });
  it('should convert format locale dates', function() {
    formattedDate = blogophonDateFormat(date, 'locale', 'de');
    assert.equal(formattedDate, '31.12.2016');
    assert.notEqual(formattedDate, blogophonDateFormat(date, 'locale', 'en'));
  });
  it('should do timestamps', function() {
    formattedDate = blogophonDateFormat(date, 'timestamp');
    assert.equal(formattedDate, 1483183972);
    assert.ok(formattedDate > 1483183900);
  });
  it('should work like https://github.com/felixge/node-dateformat', function() {
    formattedDate = blogophonDateFormat(date, 'yymd');
    assert.equal(formattedDate, '161231');
  });
});
