'use strict';

const assert = require('assert');
const path   = require('path');

describe('Ampify', function() {
  const config = require('../lib/config')(__dirname);
  const editor = require('../lib/editor')(config);

  it('should do titleForFilename', function() {
    assert.equal(editor.titleForFilename('Foo and Bar', { postFileMode: null }, '2018-08-07'), 'Foo and Bar');
    assert.equal(editor.titleForFilename('Foo and Bar', { postFileMode: '' }, '2018-08-07'), 'Foo and Bar');
    assert.equal(editor.titleForFilename('Foo and Bar', { postFileMode: 'Title' }, '2018-08-07'), 'Foo and Bar');
    assert.equal(
      editor.titleForFilename('Foo and Bar', { postFileMode: 'Title-Date' }, '2018-08-07'),
      'Foo and Bar-2018-08-07'
    );
  });

  it('should do filenameFromTitle', function() {
    assert.equal(editor.filenameFromTitle('Foo and Bar'), path.join(config.directories.data, 'foo-bar', 'index.md'));
    assert.equal(editor.filenameFromTitle('Foo and Bar', 0), path.join(config.directories.data, 'foo-bar.md'));
    assert.equal(editor.filenameFromTitle('Foo and Bar', 1), path.join(config.directories.data, 'foo-bar', 'index.md'));
  });

  it('should do getAttachmentDirectoryFromFilename', function() {
    assert.equal(editor.getAttachmentDirectoryFromFilename('/post/bla/index.md'), path.dirname('/post/bla/index.md'));
    assert.equal(editor.getAttachmentDirectoryFromFilename('/post/bla/index.md'), '/post/bla');
    assert.equal(editor.getAttachmentDirectoryFromFilename('/post/bla.md'), '/post/bla');
  });

  it('should do isSlugInDirectory', function() {
    assert.equal(editor.isSlugInDirectory('/bla/index.md'), true);
    assert.equal(editor.isSlugInDirectory('/post/bla/index.md'), true);
    assert.equal(editor.isSlugInDirectory('/bla/blubb.md'), false);
    assert.equal(editor.isSlugInDirectory('/post/bla/blubb.md'), false);
  });

  it('should do getSlugFromFilename', function() {
    assert.equal(editor.getSlugFromFilename('/bla/index.md'), 'bla');
    assert.equal(editor.getSlugFromFilename('/post/bla/index.md'), 'bla');
    assert.equal(editor.getSlugFromFilename('/bla/blubb.md'), 'blubb');
    assert.equal(editor.getSlugFromFilename('/post/bla/blubb.md'), 'blubb');
  });
});
