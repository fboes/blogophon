
exports.testBasicProperties = function(test) {
  'use strict';
  test.expect(9);

  var item = {
      htmlTeaser: 1,
      meta: {
        AbsoluteUrl: 2,
        Title: 3,
        rfcDate: 4,
        tags: [6,7]
      }
  };
  var rssjs = require('../src/rssjs')([item], new Date());

  test.ok(rssjs.version);
  test.ok(rssjs.channel);
  test.ok(rssjs.channel.title);
  test.ok(rssjs.channel.link);
  test.ok(rssjs.channel.description);
  test.ok(rssjs.channel.items[0]);
  test.ok(rssjs.channel.items[0].title);
  test.ok(rssjs.channel.items[0].link);
  test.ok(rssjs.channel.items[0].description);

  test.done();
};
