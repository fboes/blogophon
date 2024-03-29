import assert from 'assert';
import configJs from '../lib/config.js';
import slackedJs from '../lib/models/slacked.js';

describe('Slacked', function() {
  const config = configJs( process.cwd() + '/test');
  const pubDate = '2016-12-31';

  const item = {
    htmlTeaser: 1,
    meta: {
      AbsoluteUrl: 2,
      Title: 3,
      Description: 9,
      Created: pubDate,
      tags: [6, 7]
    }
  };
  const slacked = slackedJs([item], pubDate, config);

  //console.log(slacked);

  it('should have a text', function() {
    assert.strictEqual(true, slacked.text !== undefined);
  });
  it('should have attachments', function() {
    assert.strictEqual(true, slacked.attachments !== undefined);
  });
  it('should have a first attachment', function() {
    assert.strictEqual(true, slacked.attachments[0] !== undefined);
  });
  it('should have a title for the first attachment', function() {
    assert.strictEqual(true, slacked.attachments[0].title !== undefined);
  });
  it('should have a title_link for the first attachment', function() {
    assert.strictEqual(true, slacked.attachments[0].title_link !== undefined);
  });
  it('should have a text for the first attachment', function() {
    assert.strictEqual(true, slacked.attachments[0].text !== undefined);
  });
  it('should have a timestamp for the first attachment', function() {
    assert.strictEqual(true, slacked.attachments[0].ts !== undefined);
  });
});
