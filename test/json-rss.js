'use strict';

const assert = require('assert');

describe('JSON-RSS', function() {
  const config = require('../lib/config')(__dirname);

  const item = {
    htmlTeaser: 1,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Created: new Date('2016-12-31'),
      tags: [6, 7]
    }
  };
  const jsonRss = require('../lib/models/json-rss')([item], '2016-12-31', config);

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
  });

  it('should have date properties', function() {
    assert.ok(jsonRss.channel.items[0].pubDate !== undefined);
    assert.ok(jsonRss.channel.items[0].pubDate.match(/Sat, 31 Dec 2016/));
    assert.equal(jsonRss.channel.items[0].pubDateTs, 1483142400);
  });
});
