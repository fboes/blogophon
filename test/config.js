'use strict';

const assert = require('assert');
const config = require('../lib/config');

describe('Config', function() {
  it('should test ConfigProperties', function() {
    assert.ok(config.locale,      'config.locale is present');
    assert.ok(config.locale.language,   'config.locale.language is present');
    assert.ok(config.locale.direction,  'config.locale.direction is present');
    assert.ok(config.baseUrl,       'config.baseUrl is present');
    assert.ok(config.basePath,      'config.basePath is present');
    assert.ok(config.themeConf,     'config.themeConf is present');
    assert.ok(config.directories,   'config.directories is present');
    assert.ok(config.htdocs,        'config.htdocs is present');
    assert.ok(config.htdocs.posts,  'config.htdocs.posts is present');
    assert.ok(config.htdocs.tag,    'config.htdocs.tag is present');
    assert.ok(config.htdocs.author, 'config.htdocs.author is present');
  });
});
