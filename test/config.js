'use strict';

const assert = require('assert');

describe('Config', function() {
  ['', '/', __dirname].forEach(function(dirname) {
    let config = require('../lib/config')(dirname);
    //console.log(config);
    describe('for all config files in `' + dirname + '`', function() {
      it('should have locale properties', function() {
        assert.ok(config.locale,               'config.locale is present');
        assert.ok(config.locale.language,      'config.locale.language is present');
        assert.ok(config.locale.languagePosix, 'config.locale.languagePosix is present');
        assert.ok(config.locale.direction,     'config.locale.direction is present');
      });
      it('should have URL properties', function() {
        assert.ok(config.baseUrl,       'config.baseUrl is present');
        assert.ok(config.basePath,      'config.basePath is present');
      });
      it('should have directory properties', function() {
        assert.ok(config.themeConf,     'config.themeConf is present');
        assert.ok(config.directories,   'config.directories is present');
        assert.ok(config.htdocs,        'config.htdocs is present');
        assert.ok(config.htdocs.posts,  'config.htdocs.posts is present');
        assert.ok(config.htdocs.tag,    'config.htdocs.tag is present');
        assert.ok(config.htdocs.author, 'config.htdocs.author is present');
      });
      it('should have time properties', function() {
        assert.ok(config.timeZone,      'config.timeZone is present');
      });
      it('should have a Blogophon version string', function() {
        assert.ok(config.generator,     'config.generator is present');
      });
    });

    if (dirname === '/') {
      describe('with uninitialized config file', function() {
        it('should have the values for uninitialized config files', function() {
          assert.ok(config.notInitialized, 'Flag for not initialized is present');
        });
      });
    }
    if (dirname === __dirname) {
      describe('with dummy config file', function() {
        it('should have values of given config file', function() {
          assert.equal(config.baseUrl, 'https://www.example.com:8080');
          assert.equal(config.domain,  'www.example.com');
        });
      });
    }
  });
});
