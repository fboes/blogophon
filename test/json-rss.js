import assert from 'assert';
import configJs from '../lib/config.js';
import jsonRssJs from '../lib/models/json-rss.js';

describe('JSON-RSS', function() {
  const config = configJs( process.cwd() + '/test');

  const item = {
    htmlTeaser: 1,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Created: new Date('2016-12-31'),
      Modified: new Date('2017-01-01'),
      tags: [6, 7]
    }
  };
  const jsonRss = jsonRssJs([item], '2016-12-31', config);

  it('should have basic properties', function() {
    assert.ok(jsonRss.version !== undefined);
    assert.ok(jsonRss.channel !== undefined);
    assert.ok(jsonRss.channel.title !== undefined);
    assert.ok(jsonRss.channel.link !== undefined);
    assert.ok(jsonRss.channel.description !== undefined);
    assert.ok(jsonRss.channel.language !== undefined);
    assert.ok(jsonRss.channel.atom_updated !== undefined);
    assert.ok(jsonRss.channel.items[0] !== undefined);
    assert.ok(jsonRss.channel.items[0].title !== undefined);
    assert.ok(jsonRss.channel.items[0].link !== undefined);
    assert.ok(jsonRss.channel.items[0].description !== undefined);
    assert.ok(jsonRss.channel.items[0].content_encoded !== undefined);
  });

  it('should have date properties', function() {
    assert.ok(jsonRss.channel.items[0].pubDate !== undefined);
    assert.ok(jsonRss.channel.items[0].pubDate.match(/Sat, 31 Dec 2016/));
    assert.ok(jsonRss.channel.items[0].atom_updated !== undefined);
    assert.ok(jsonRss.channel.items[0].atom_published !== undefined);
  });
});
