'use strict';

const assert = require('assert');
const blogophonDateFormat = require('../lib/helpers/blogophon-date-format');

describe('Blogophon Date Format', function() {
  const date = '2016-12-31 13:32:52+02:00';
  let formattedDate = '';

  it('should convert ISO 8601 dates', function() {
    formattedDate = blogophonDateFormat(date, 'iso');
    assert.ok(formattedDate.match(/2016-12-31T/));
    assert.equal(formattedDate, blogophonDateFormat(date, 'iso8601'));
  });

  it('should convert RFC 2822 dates', function() {
    formattedDate = blogophonDateFormat(date, 'rfc');
    assert.ok(formattedDate.match(/Sat, 31 Dec 2016/));
    assert.equal(formattedDate, blogophonDateFormat(date, 'rfc2822'));
  });

  it('should convert format locale dates', function() {
    formattedDate = blogophonDateFormat(date, 'locale', 'de');
    assert.equal(formattedDate, '31.12.2016');
    assert.notEqual(formattedDate, blogophonDateFormat(date, 'locale', 'en'));

    formattedDate = blogophonDateFormat(date, 'locale', 'de-DE');
    assert.equal(formattedDate, '31.12.2016');

    formattedDate = blogophonDateFormat(date, 'locale', 'en');
    assert.equal(formattedDate, '31/12/2016');

    formattedDate = blogophonDateFormat(date, 'locale', 'en-GB');
    assert.equal(formattedDate, '31/12/2016');

    formattedDate = blogophonDateFormat(date, 'locale', 'en-US');
    assert.equal(formattedDate, '12/31/2016');
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
