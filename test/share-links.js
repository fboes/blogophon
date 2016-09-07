var shareLink = require('../src/helpers/share-links');

exports.testBasicProperties = function(test) {
  'use strict';
  test.expect(5);

  var share = shareLink(1,2,3,4);

  test.ok(share.twitter);
  test.ok(share.facebook);
  test.ok(share.gplus);
  test.ok(share.whatsapp);
  test.ok(share.email);

  test.done();
};

exports.testBasicProperties = function(test) {
  'use strict';
  test.expect(13);

  var testData = {
    title: 'Gollum',
    link: 'www.example.com',
    description: 'Mordor',
    siteName: 'MiddleEarth',
  };
  var share = shareLink(testData.title,testData.link,testData.description,testData.siteName);

  var testMatch = {
    title      : function(str) { return str.match(new RegExp(testData.title)); },
    link       : function(str) { return str.match(new RegExp(testData.link)); },
    description: function(str) { return str.match(new RegExp(testData.description)); },
    siteName   : function(str) { return str.match(new RegExp(testData.siteName)); },
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

  test.done();
};
