import assert from 'assert';
import blogophonDateFormat from '../lib/helpers/blogophon-date-format.js';

describe('Blogophon Date Format', function() {
  const date = '2016-12-31 13:32:52+02:00';
  let formattedDate = '';

  it('should convert ISO 8601 dates', function() {
    formattedDate = blogophonDateFormat(date, 'iso');
    assert.match(formattedDate, /2016-12-31T/);
    assert.strictEqual(formattedDate, blogophonDateFormat(date, 'iso8601'));
  });

  it('should convert RFC 2822 dates', function() {
    formattedDate = blogophonDateFormat(date, 'rfc');
    assert.match(formattedDate, /Sat, 31 Dec 2016/);
    assert.strictEqual(formattedDate, blogophonDateFormat(date, 'rfc2822'));
  });

  it('should convert format locale dates', function() {
    formattedDate = blogophonDateFormat(date, 'locale', 'de');
    assert.strictEqual(formattedDate, '31.12.2016');
    assert.notStrictEqual(formattedDate, blogophonDateFormat(date, 'locale', 'en'));

    formattedDate = blogophonDateFormat(date, 'locale', 'de-DE');
    assert.strictEqual(formattedDate, '31.12.2016');

    formattedDate = blogophonDateFormat(date, 'locale', 'en');
    assert.strictEqual(formattedDate, '31/12/2016');

    formattedDate = blogophonDateFormat(date, 'locale', 'en-GB');
    assert.strictEqual(formattedDate, '31/12/2016');

    formattedDate = blogophonDateFormat(date, 'locale', 'en-US');
    assert.strictEqual(formattedDate, '12/31/2016');
  });

  it('should do timestamps', function() {
    formattedDate = blogophonDateFormat(date, 'timestamp');
    assert.strictEqual(formattedDate, 1483183972);
    assert.ok(formattedDate > 1483183900);
  });

  it('should work like https://github.com/felixge/node-dateformat', function() {
    formattedDate = blogophonDateFormat(date, 'yymd');
    assert.strictEqual(formattedDate, '161231');
  });
});
