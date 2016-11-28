var blogophonDate = require('../src/models/blogophon-date');

exports.basicTest = function basicTest(test) {
  'use strict';
  test.expect(10+10+10);

  var germanDate  = blogophonDate('2016-12-31', 'de');
  var englishDate = blogophonDate('2016-12-31', 'en');


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
  test.equals(germanDate.rfc, englishDate.rfc);
  test.equals(germanDate.ics, englishDate.ics);
  test.ok(germanDate.ics.match(/^\d+T\d+.$/), 'String like 20060910T220000Z');
  test.ok(germanDate.icsDay.match(/^\d+$/), 'String like 20060910');
  test.ok(germanDate.year.match(/^\d+$/), 'String like 2006');
  test.ok(germanDate.month.match(/^\d+$/), 'String like 09');
  test.ok(germanDate.day.match(/^\d+$/), 'String like 10');
  test.equals(germanDate.timestamp, englishDate.timestamp);

  //console.log(englishDate);
  //console.log(germanDate);

  test.done();
};
