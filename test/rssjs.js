
exports.testBasicProperties = function(test) {
  'use strict';
  test.expect(9);

  var config = require('../src/config');
  var item = {
      htmlTeaser: 1,
      meta: {
        AbsoluteUrl: 2,
        Title: 3,
        rfcDate: 4,
        tags: [6,7]
      }
  };
  var rssjs = require('../src/models/rssjs')([item], new Date(), config);

  test.ok(rssjs.version !== undefined);
  test.ok(rssjs.channel !== undefined);
  test.ok(rssjs.channel.title !== undefined);
  test.ok(rssjs.channel.link !== undefined);
  test.ok(rssjs.channel.description !== undefined);
  test.ok(rssjs.channel.items[0] !== undefined);
  test.ok(rssjs.channel.items[0].title !== undefined);
  test.ok(rssjs.channel.items[0].link !== undefined);
  test.ok(rssjs.channel.items[0].description !== undefined);

  test.done();
};
