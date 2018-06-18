'use strict';

const assert = require('assert');
const blogophonDate = require('../lib/models/blogophon-date');

describe('Slacked', function() {
  const config = require('../lib/config');
  const pubDate = blogophonDate('2016-12-31', 'en');

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
  const slacked = require('../lib/models/slacked')([item], pubDate, config);

  //console.log(slacked);

  it('should have a text', function() {
    assert.equal(true, slacked.text !== undefined);
  });
  it('should have attachments', function() {
    assert.equal(true, slacked.attachments !== undefined);
  });
  it('should have a first attachment', function() {
    assert.equal(true, slacked.attachments[0] !== undefined);
  });
  it('should have a title for the first attachment', function() {
    assert.equal(true, slacked.attachments[0].title !== undefined);
  });
  it('should have a title_link for the first attachment', function() {
    assert.equal(true, slacked.attachments[0].title_link !== undefined);
  });
  it('should have a text for the first attachment', function() {
    assert.equal(true, slacked.attachments[0].text !== undefined);
  });
  it('should have a timestamp for the first attachment', function() {
    assert.equal(true, slacked.attachments[0].ts !== undefined);
  });
});
