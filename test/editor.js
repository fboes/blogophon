'use strict';

const assert = require('assert');
const path   = require('path');

describe('Ampify', function() {
  const config = require('../lib/config')(__dirname);
  const editor = require('../lib/editor')(config);

  it('should convert titleForFilename', function() {
    assert.equal(editor.titleForFilename('Foo and Bar', { postFileMode: null }, '2018-08-07'), 'Foo and Bar');
    assert.equal(editor.titleForFilename('Foo and Bar', { postFileMode: '' }, '2018-08-07'), 'Foo and Bar');
    assert.equal(editor.titleForFilename('Foo and Bar', { postFileMode: 'Title' }, '2018-08-07'), 'Foo and Bar');
    assert.equal(editor.titleForFilename('Foo and Bar', { postFileMode: 'Title-Date' }, '2018-08-07'), 'Foo and Bar-2018-08-07');
  });

  it('should convert filenameFromTitle', function() {
    assert.equal(editor.filenameFromTitle('Foo and Bar'), path.join(config.directories.data, 'foo-bar', 'index.md'));
  });

  it('should convert dirnameFromFilename', function() {
    assert.equal(editor.dirnameFromFilename('/bla/index.md'), path.dirname('/bla/index.md'));
    assert.equal(editor.dirnameFromFilename('/bla/index.md'), '/bla');
  });

});
