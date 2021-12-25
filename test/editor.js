
import assert from 'assert';
import path from 'path';
import configJs from '../lib/config.js';
import editorJs from '../lib/editor.js';

describe('Ampify', function() {
  const config = configJs( process.cwd() + '/test');
  const editor = editorJs(config);

  it('should do titleForFilename', function() {
    assert.strictEqual(editor.titleForFilename('Foo and Bar', { postFileMode: null }, '2018-08-07'), 'Foo and Bar');
    assert.strictEqual(editor.titleForFilename('Foo and Bar', { postFileMode: '' }, '2018-08-07'), 'Foo and Bar');
    assert.strictEqual(editor.titleForFilename('Foo and Bar', { postFileMode: 'Title' }, '2018-08-07'), 'Foo and Bar');
    assert.strictEqual(
      editor.titleForFilename('Foo and Bar', { postFileMode: 'Title-Date' }, '2018-08-07'),
      'Foo and Bar-2018-08-07'
    );
  });

  it('should do filenameFromTitle', function() {
    assert.strictEqual(editor.filenameFromTitle('Foo and Bar'), path.join(config.directories.data, 'foo-bar', 'index.md'));
    assert.strictEqual(editor.filenameFromTitle('Foo and Bar', 0), path.join(config.directories.data, 'foo-bar.md'));
    assert.strictEqual(editor.filenameFromTitle('Foo and Bar', 1), path.join(config.directories.data, 'foo-bar', 'index.md'));
  });

  it('should do getAttachmentDirectoryFromFilename', function() {
    assert.strictEqual(editor.getAttachmentDirectoryFromFilename('/post/bla/index.md'), path.dirname('/post/bla/index.md'));
    assert.strictEqual(editor.getAttachmentDirectoryFromFilename('/post/bla/index.md'), '/post/bla');
    assert.strictEqual(editor.getAttachmentDirectoryFromFilename('/post/bla.md'), '/post/bla');
  });

  it('should do isSlugInDirectory', function() {
    assert.strictEqual(editor.isSlugInDirectory('/bla/index.md'), true);
    assert.strictEqual(editor.isSlugInDirectory('/post/bla/index.md'), true);
    assert.strictEqual(editor.isSlugInDirectory('/bla/blubb.md'), false);
    assert.strictEqual(editor.isSlugInDirectory('/post/bla/blubb.md'), false);
  });

  it('should do getSlugFromFilename', function() {
    assert.strictEqual(editor.getSlugFromFilename('/bla/index.md'), 'bla');
    assert.strictEqual(editor.getSlugFromFilename('/post/bla/index.md'), 'bla');
    assert.strictEqual(editor.getSlugFromFilename('/bla/blubb.md'), 'blubb');
    assert.strictEqual(editor.getSlugFromFilename('/post/bla/blubb.md'), 'blubb');
  });
});
