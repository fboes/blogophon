'use strict';

const assert = require('assert');
const blogophonDate = require('../lib/models/blogophon-date');

describe('JSON-RSS', function() {
  const config = require('../lib/config');
  const pubDate = blogophonDate('2016-12-31', 'en');

  const item = {
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
  const jsonRss = require('../lib/models/json-rss')([item], pubDate, config);

  it('should have basic properties', function() {
    assert.ok(jsonRss.version !== undefined);
    assert.ok(jsonRss.channel !== undefined);
    assert.ok(jsonRss.channel.title !== undefined);
    assert.ok(jsonRss.channel.link !== undefined);
    assert.ok(jsonRss.channel.description !== undefined);
    assert.ok(jsonRss.channel.language !== undefined);
    assert.equal(jsonRss.channel.lastBuildDateTs, 1483142400);
    assert.ok(jsonRss.channel.items[0] !== undefined);
    assert.ok(jsonRss.channel.items[0].title !== undefined);
    assert.ok(jsonRss.channel.items[0].link !== undefined);
    assert.ok(jsonRss.channel.items[0].description !== undefined);
    assert.ok(jsonRss.channel.items[0].pubDate !== undefined);
    assert.equal(jsonRss.channel.items[0].pubDate, 4);
    assert.equal(jsonRss.channel.items[0].pubDateTs, 5);
  });
});
