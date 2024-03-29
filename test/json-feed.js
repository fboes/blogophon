import assert from 'assert';
import configJs from '../lib/config.js';
import jsonFeedJs from '../lib/models/json-feed.js';

describe('JsonFeed', function() {
  const config = configJs( process.cwd() + '/test');

  const item = {
    htmlTeaser: '1',
    html: '33',
    meta: {
      AbsoluteUrl: '2',
      Title: '3',
      Created: new Date('2017-05-18'),
      Modified: new Date('2017-05-28'),
      tags: ['6', '7'],
      Description: '8',
      Language: 'en',
      Schema: 'http://schema.org/BlogPosting'
    }
  };
  const jsonFeed = jsonFeedJs([item], '2016-12-31', config, 'title', 'url');
  //console.log(jsonFeed);

  it('should have basic properties', function() {
    assert.ok(jsonFeed.version);
    assert.ok(jsonFeed.title);
    assert.ok(jsonFeed.home_page_url);
    assert.ok(jsonFeed.feed_url);
    assert.ok(jsonFeed.authors);
    assert.ok(jsonFeed.description);
    assert.ok(jsonFeed.language);
  });

  it('should have items with properties', function() {
    assert.strictEqual(jsonFeed.items.length, 1);
    assert.ok(jsonFeed.items[0]);
    assert.ok(jsonFeed.items[0].url);
    assert.ok(jsonFeed.items[0].title);
    assert.ok(jsonFeed.items[0].summary);
    assert.ok(jsonFeed.items[0].language);
    assert.ok(jsonFeed.items[0].authors);
    assert.ok(jsonFeed.items[0].date_published);
    assert.ok(jsonFeed.items[0].date_modified);
  });

  it('should have proper dates', function() {
    assert.match(jsonFeed.items[0].date_published, /^2017-05-18T/);
    assert.match(jsonFeed.items[0].date_modified, /^2017-05-28T/);
  });
});
