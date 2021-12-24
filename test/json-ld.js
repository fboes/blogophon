
import assert from 'assert';
import configJs from '../lib/config.js';
import jsonLdJs from '../lib/models/json-ld.js';

describe('jsonLd', function() {
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
  const jsonLd = jsonLdJs(item, config);
  // console.log(jsonLd);

  it('should have basic properties', function() {
    assert.ok(jsonLd['@context']);
    assert.ok(jsonLd['@type']);
    assert.ok(jsonLd.author);
    assert.ok(jsonLd.publisher);
  });

  it('should have matching properties', function() {
    assert.strictEqual(jsonLd.headline, item.meta.Title);
  });

  it('should have proper dates', function() {
    assert.ok(jsonLd.datePublished.match(/^2017-05-18T/));
    assert.ok(jsonLd.dateModified.match(/^2017-05-28T/));
  });
});
