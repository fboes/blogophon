'use strict';

const assert = require('assert');
const blogophonDate = require('../lib/models/blogophon-date');

describe('Blogophon Date', function() {
  it('should convert English and German dates', function() {
    const germanDate  = blogophonDate('2016-12-31', 'de');
    const englishDate = blogophonDate('2016-12-31', 'en');

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

  it('moreTests', function() {
    let germanDate  = blogophonDate('2016-01-01 17:59:00 +00:00', 'de');

    assert.equal(germanDate.year, '2016');
    assert.equal(germanDate.month, '01');
    assert.equal(germanDate.day, '01');

    //console.log(germanDate);
  });

  it('exocticTimestamps', function() {
    let germanDate;
    germanDate = blogophonDate('2016-08-25T19:13:12+02:00', 'de');

    assert.equal(germanDate.year, '2016');
    assert.equal(germanDate.month, '08');
    assert.equal(germanDate.day, '25');

    germanDate = blogophonDate(new Date('2016-08-25T19:13:12+02:00'), 'de');

    assert.equal(germanDate.year, '2016');
    assert.equal(germanDate.month, '08');
    assert.equal(germanDate.day, '25');

    //console.log(germanDate);
  });
});
