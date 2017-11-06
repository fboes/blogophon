'use strict';

const blogophonDate = require('../lib/models/blogophon-date');

exports.testBasicProperties = function(test) {
  test.expect(11);

  const config = require('../lib/config');
  const pubDate = blogophonDate('2016-12-31', 'en');

  const item = {
    htmlTeaser: 1,
    html: 33,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Created: blogophonDate('2017-05-18'),
      Modified: blogophonDate('2016-05-19'),
      tags: [6, 7],
      Description: 8,
      Language: 'en'
    }
  };
  const jsonFeed = require('../lib/models/json-feed')([item], pubDate, config, 'title', 'url');

  //console.log(jsonFeed);

  test.ok(jsonFeed.version !== undefined);
  test.ok(jsonFeed.title !== undefined);
  test.ok(jsonFeed.home_page_url !== undefined);
  test.ok(jsonFeed.feed_url !== undefined);
  test.ok(jsonFeed.description !== undefined);
  test.ok(jsonFeed.items[0]);
  test.ok(jsonFeed.items[0].url);
  test.ok(jsonFeed.items[0].title);
  test.ok(jsonFeed.items[0].summary);
  test.ok(jsonFeed.items[0].date_published);
  test.ok(jsonFeed.items[0].date_modified);

  test.done();
};
