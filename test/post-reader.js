
import assert from 'assert';
import PostReader from '../lib/post-reader.js';

describe('Post-Reader', function() {
  it('should test Errors', function() {
    PostReader('./test/test-1.md')
      .then(function(testPost) {
        // console.log(testPost);
        assert.ok(testPost.markdown, 'Found Markdown');
        assert.ok(testPost.meta,     'Parsed YAML');
        assert.equal(testPost.meta.Title,        'Title');
        assert.equal(testPost.meta.Description,  'Some nice text');
        assert.equal(testPost.meta.Twitter,      '#Hashtag and some text');
        assert.equal(testPost.meta.Language,     'en');
        assert.equal(testPost.meta.Link,         'http://www.example.com/');
      })
      .catch(function() {
        assert.ok(false, 'Parser should not fail');
      })
    ;
  });

  it('should handle Markdown in certain parts', function() {
    PostReader('./test/test-2.md')
      .then(function(testPost) {
        assert.ok(testPost.markdown, 'Found Markdown');
        assert.ok(testPost.meta,     'Parsed YAML');
        assert.equal(testPost.meta.Title,  'Markdown title of your document, with <b> code');
        assert.equal(testPost.htmlTitle,  '<em>Markdown</em> title of your <b>document</b>, with <code>&lt;b&gt;</code> code');
        assert.equal(testPost.meta.Description, 'This part can be seen on index pages, and may contain links and any other form of Markdown, with <b> code.');
        assert.equal(testPost.htmlTeaser, '<p><em>This</em> part can be seen on index pages, and may contain <a href="https://www.example.com/">links</a> and any other form of <b>Markdown</b>, with <code>&lt;b&gt;</code> code.</p>');
        /*console.log([
          testPost.meta.Title,
          testPost.htmlTitle,
          testPost.meta.Description,
          testPost.htmlTeaser
        ]);*/
      })
      .catch(function() {
        assert.ok(false, 'Parser should not fail');
      })
    ;
  });
});
