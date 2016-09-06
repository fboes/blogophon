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
