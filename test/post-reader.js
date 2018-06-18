'use strict';

const assert = require('assert');
const PostReader = require('../lib/post-reader');

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
});
