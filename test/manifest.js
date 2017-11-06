'use strict';

exports.testBasicProperties = function(test) {
  test.expect(5);

  const config = require('../lib/config');
  const manifest = require('../lib/models/manifest')(config);

  // console.log(manifest);

  test.ok(manifest.lang !== undefined,        'Language is defined');
  test.ok(manifest.name !== undefined,        'Name is defined');
  test.ok(manifest.description !== undefined, 'Description is defined');
  test.ok(manifest.theme_color !== undefined, 'Theme color is defined');
  test.ok(manifest.start_url !== undefined,   'Start URL is defined');

  test.done();
};
