'use strict';

const shareLink = require('../lib/helpers/share-links');

exports.testBasicProperties = function(test) {
  test.expect(5);

  const share = shareLink(1, 2, 3, 4);

  test.ok(share.twitter);
  test.ok(share.facebook);
  test.ok(share.gplus);
  test.ok(share.whatsapp);
  test.ok(share.email);

  test.done();
};

exports.testBasicProperties = function(test) {
  test.expect(19);

  let testData = {
    title: 'Gollum',
    link: 'www.example.com',
    description: 'Mordor',
    siteName: 'MiddleEarth'
  };
  let share = shareLink(testData.title, testData.link, testData.description, testData.siteName);

  let testMatch = {
    title: function(str) {
      return str.match(new RegExp(testData.title));
    },
    link: function(str) {
      return str.match(new RegExp(testData.link));
    },
    description: function(str) {
      return str.match(new RegExp(testData.description));
    },
    siteName: function(str) {
      return str.match(new RegExp(testData.siteName));
    }
  };

  test.ok(share.twitter);
  test.ok(testMatch.link(share.twitter));
  test.ok(testMatch.description(share.twitter));

  test.ok(share.facebook);
  test.ok(testMatch.link(share.facebook));

  test.ok(share.gplus);
  test.ok(testMatch.link(share.gplus));

  test.ok(share.whatsapp);
  test.ok(testMatch.link(share.whatsapp));
  test.ok(testMatch.title(share.whatsapp));

  test.ok(share.email);
  test.ok(testMatch.link(share.email));
  test.ok(testMatch.title(share.whatsapp));

  test.ok(share.wordpress);
  test.ok(testMatch.link(share.wordpress));

  test.ok(share.tumblr);
  test.ok(testMatch.link(share.tumblr));

  test.ok(share.pocket);
  test.ok(testMatch.link(share.pocket));

  test.done();
};
