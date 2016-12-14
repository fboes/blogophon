'use strict';

exports.testBasicProperties = function(test) {
  test.expect(10);

  var config = require('../src/config');
  var item = {
    htmlTeaser: 1,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Created: {
        rfc: 4
      },
      tags: [6, 7]
    }
  };
  var jsonRss = require('../src/models/json-rss')([item], new Date(), config);

  test.ok(jsonRss.version !== undefined);
  test.ok(jsonRss.channel !== undefined);
  test.ok(jsonRss.channel.title !== undefined);
  test.ok(jsonRss.channel.link !== undefined);
  test.ok(jsonRss.channel.description !== undefined);
  test.ok(jsonRss.channel.items[0] !== undefined);
  test.ok(jsonRss.channel.items[0].title !== undefined);
  test.ok(jsonRss.channel.items[0].link !== undefined);
  test.ok(jsonRss.channel.items[0].description !== undefined);
  test.ok(jsonRss.channel.items[0].pubDate !== undefined);

  test.done();
};
