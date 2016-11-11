var config = require('../src/config');

exports.testConfigProperties = function testConfigProperties(test) {
  'use strict';
  test.expect(9);

  test.ok(config.language,    'config.language is present');
  test.ok(config.baseUrl,     'config.baseUrl is present');
  test.ok(config.basePath,    'config.basePath is present');
  test.ok(config.themeConf,   'config.themeConf is present');
  test.ok(config.directories, 'config.directories is present');
  test.ok(config.htdocs,      'config.htdocs is present');
  test.ok(config.htdocs.posts,'config.htdocs.posts is present');
  test.ok(config.htdocs.tag,  'config.htdocs.tag is present');
  test.ok(config.htdocs.author,'config.htdocs.author is present');

  test.done();
};
