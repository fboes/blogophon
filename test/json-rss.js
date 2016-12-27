'use strict';

var blogophonDate = require('../src/models/blogophon-date');

exports.testBasicProperties = function(test) {
  test.expect(13);

  var config = require('../src/config');
  var pubDate = blogophonDate('2016-12-31', 'en');

  var item = {
    htmlTeaser: 1,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Created: {
        rfc: 4,
        timestamp: 5
      },
      tags: [6, 7]
    }
  };
  var jsonRss = require('../src/models/json-rss')([item], pubDate, config);

  test.ok(jsonRss.version !== undefined);
  test.ok(jsonRss.channel !== undefined);
  test.ok(jsonRss.channel.title !== undefined);
  test.ok(jsonRss.channel.link !== undefined);
  test.ok(jsonRss.channel.description !== undefined);
  test.equals(jsonRss.channel.lastBuildDateTs, 1483142400);
  test.ok(jsonRss.channel.items[0] !== undefined);
  test.ok(jsonRss.channel.items[0].title !== undefined);
  test.ok(jsonRss.channel.items[0].link !== undefined);
  test.ok(jsonRss.channel.items[0].description !== undefined);
  test.ok(jsonRss.channel.items[0].pubDate !== undefined);
  test.equals(jsonRss.channel.items[0].pubDate, 4);
  test.equals(jsonRss.channel.items[0].pubDateTs, 5);

  test.done();
};
