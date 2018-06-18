'use strict';

const assert = require('assert');
const blogophonDate = require('../lib/models/blogophon-date');

describe('Blogophon Date', function() {
  describe('Germany vs England', function() {

    const germanDate  = blogophonDate('2016-12-31', 'de');
    const englishDate = blogophonDate('2016-12-31', 'en');

    it('should convert German dates', function() {
      assert.ok(germanDate);
      assert.ok(germanDate.locale);
      assert.ok(germanDate.iso);
      assert.ok(germanDate.rfc);
      assert.ok(germanDate.ics);
      assert.ok(germanDate.icsDay);
      assert.ok(germanDate.timestamp);
      assert.ok(germanDate.year);
      assert.ok(germanDate.month);
      assert.ok(germanDate.day);
    });

    it('should convert English dates', function() {
      assert.ok(englishDate);
      assert.ok(englishDate.locale);
      assert.ok(englishDate.iso);
      assert.ok(englishDate.rfc);
      assert.ok(englishDate.ics);
      assert.ok(englishDate.icsDay);
      assert.ok(englishDate.timestamp);
      assert.ok(englishDate.year);
      assert.ok(englishDate.month);
      assert.ok(englishDate.day);
    });

    it('should have some matching German & English dates', function() {
      assert.ok(englishDate.locale !== germanDate.locale);
      assert.equal(germanDate.iso, englishDate.iso);
      assert.ok(germanDate.iso.match(/[+-]\d+:\d+$/), 'Proper timezone at the end of string');
      assert.equal(germanDate.rfc, englishDate.rfc);
      assert.ok(germanDate.rfc.match(/[+-]\d+$/), 'Proper timezone at the end of string');
      assert.equal(germanDate.ics, englishDate.ics);
      assert.ok(germanDate.ics.match(/^\d+T\d+.$/), 'String like 20060910T220000Z');
      assert.ok(germanDate.icsDay.match(/^\d+$/), 'String like 20060910');
      assert.equal(germanDate.year, '2016');
      assert.equal(germanDate.month, '12');
      assert.equal(germanDate.day, '31');
      assert.equal(germanDate.timestamp, englishDate.timestamp);

      //console.log(englishDate);
      //console.log(germanDate);
    });
  });

  describe('Converting dates', function() {
    let germanDate  = blogophonDate('2016-01-01 17:59:00 +00:00', 'de');
    //console.log(germanDate);

    it('should convert from a complex string to the correct date', function() {
      assert.equal(germanDate.year, '2016');
      assert.equal(germanDate.month, '01');
      assert.equal(germanDate.day, '01');
    });

    it('should convert from a complex string to the correct date, too', function() {
      germanDate = blogophonDate('2016-08-25T19:13:12+02:00', 'de');

      assert.equal(germanDate.year, '2016');
      assert.equal(germanDate.month, '08');
      assert.equal(germanDate.day, '25');
    });

    it('should convert from a complex string to the correct date as well', function() {
      germanDate = blogophonDate(new Date('2016-08-25T19:13:12+02:00'), 'de');

      assert.equal(germanDate.year, '2016');
      assert.equal(germanDate.month, '08');
      assert.equal(germanDate.day, '25');

      //console.log(germanDate);
    });
  });
});
