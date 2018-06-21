'use strict';

const assert = require('assert');

describe('JsonFeed', function() {
  const config = require('../lib/config');

  const item = {
    htmlTeaser: 1,
    html: 33,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Created: new Date('2017-05-18'),
      Modified: new Date('2016-05-19'),
      tags: [6, 7],
      Description: 8,
      Language: 'en'
    }
  };
  const jsonFeed = require('../lib/models/json-feed')([item], '2016-12-31', config, 'title', 'url');
  //console.log(jsonFeed);

  it('should have basic properties', function() {
    assert.ok(jsonFeed.version !== undefined);
    assert.ok(jsonFeed.title !== undefined);
    assert.ok(jsonFeed.home_page_url !== undefined);
    assert.ok(jsonFeed.feed_url !== undefined);
    assert.ok(jsonFeed.description !== undefined);
    assert.ok(jsonFeed.items[0]);
    assert.ok(jsonFeed.items[0].url);
    assert.ok(jsonFeed.items[0].title);
    assert.ok(jsonFeed.items[0].summary);
    assert.ok(jsonFeed.items[0].date_published);
    assert.ok(jsonFeed.items[0].date_modified);
  });
});
