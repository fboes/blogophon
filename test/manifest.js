
exports.testBasicProperties = function(test) {
  'use strict';
  test.expect(5);

  var manifest = require('../src/manifest');

  console.log(manifest);

  test.ok(manifest.lang);
  test.ok(manifest.name);
  test.ok(manifest.description);
  test.ok(manifest.theme_color);
  test.ok(manifest.start_url);

  test.done();
};
