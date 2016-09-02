exports.testBasicProperties = function(test) {
  'use strict';
  test.expect(5);

  var config = require('../src/config');
  var manifest = require('../src/models/manifest')(config);

  // console.log(manifest);

  test.ok(manifest.lang !== undefined);
  test.ok(manifest.name !== undefined);
  test.ok(manifest.description !== undefined);
  test.ok(manifest.theme_color !== undefined);
  test.ok(manifest.start_url !== undefined);

  test.done();
};
