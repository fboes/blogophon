'use strict';

const blogophonDate = require('../src/models/blogophon-date');

exports.basicTest = function basicTest(test) {
  test.expect(10+10+12);

  const germanDate  = blogophonDate('2016-12-31', 'de');
  const englishDate = blogophonDate('2016-12-31', 'en');


  test.ok(germanDate);
  test.ok(germanDate.locale);
  test.ok(germanDate.iso);
  test.ok(germanDate.rfc);
  test.ok(germanDate.ics);
  test.ok(germanDate.icsDay);
  test.ok(germanDate.timestamp);
  test.ok(germanDate.year);
  test.ok(germanDate.month);
  test.ok(germanDate.day);

  test.ok(englishDate);
  test.ok(englishDate.locale);
  test.ok(englishDate.iso);
  test.ok(englishDate.rfc);
  test.ok(englishDate.ics);
  test.ok(englishDate.icsDay);
  test.ok(englishDate.timestamp);
  test.ok(englishDate.year);
  test.ok(englishDate.month);
  test.ok(englishDate.day);

  test.ok(englishDate.locale !== germanDate.locale);
  test.equals(germanDate.iso, englishDate.iso);
  test.ok(germanDate.iso.match(/[+-]\d+:\d+$/), 'Proper timezone at the end of string');
  test.equals(germanDate.rfc, englishDate.rfc);
  test.ok(germanDate.rfc.match(/[+-]\d+$/), 'Proper timezone at the end of string');
  test.equals(germanDate.ics, englishDate.ics);
  test.ok(germanDate.ics.match(/^\d+T\d+.$/), 'String like 20060910T220000Z');
  test.ok(germanDate.icsDay.match(/^\d+$/), 'String like 20060910');
  test.equals(germanDate.year, '2016');
  test.equals(germanDate.month, '12');
  test.equals(germanDate.day, '31');
  test.equals(germanDate.timestamp, englishDate.timestamp);

  //console.log(englishDate);
  //console.log(germanDate);

  test.done();
};

exports.moreTests = function moreTests(test) {
  test.expect(3);

  let germanDate  = blogophonDate('2016-01-01 17:59:00 +00:00', 'de');

  test.equals(germanDate.year, '2016');
  test.equals(germanDate.month, '01');
  test.equals(germanDate.day, '01');

  //console.log(germanDate);

  test.done();
};

exports.exocticTimestamps = function exocticTimestamps(test) {
  test.expect(6);

  let germanDate;
  germanDate = blogophonDate('2016-08-25T19:13:12+02:00', 'de');

  test.equals(germanDate.year, '2016');
  test.equals(germanDate.month, '08');
  test.equals(germanDate.day, '25');

  germanDate = blogophonDate(new Date('2016-08-25T19:13:12+02:00'), 'de');

  test.equals(germanDate.year, '2016');
  test.equals(germanDate.month, '08');
  test.equals(germanDate.day, '25');

  //console.log(germanDate);

  test.done();
};
