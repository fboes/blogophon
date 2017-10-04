'use strict';

const config = require('../src/config');

exports.testConfigProperties = function testConfigProperties(test) {
  test.expect(11);

  test.ok(config.locale,      'config.locale is present');
  test.ok(config.locale.language,   'config.locale.language is present');
  test.ok(config.locale.direction,  'config.locale.direction is present');
  test.ok(config.baseUrl,       'config.baseUrl is present');
  test.ok(config.basePath,      'config.basePath is present');
  test.ok(config.themeConf,     'config.themeConf is present');
  test.ok(config.directories,   'config.directories is present');
  test.ok(config.htdocs,        'config.htdocs is present');
  test.ok(config.htdocs.posts,  'config.htdocs.posts is present');
  test.ok(config.htdocs.tag,    'config.htdocs.tag is present');
  test.ok(config.htdocs.author, 'config.htdocs.author is present');

  test.done();
};
