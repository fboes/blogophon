var config = require('../src/config');

exports.testConfigProperties = function testConfigProperties(test) {
  'use strict';
  test.expect(5);

  test.ok(config.language,    'config.language is present');
  test.ok(config.baseUrl,     'config.baseUrl is present');
  test.ok(config.basePath,    'config.basePath is present');
  test.ok(config.imageStyles, 'config.imageStyles is present');
  test.ok(config.directories, 'config.directoreis is present');

  test.done();
};
