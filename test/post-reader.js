'use strict';

var PostReader = require('../src/post-reader');

exports.testErrors = function(test) {
  test.expect(7);

  PostReader('./test/test-1.md')
    .then(function(testPost) {
      // console.log(testPost);
      test.ok(testPost.markdown, 'Found Markdown');
      test.ok(testPost.meta,     'Parsed YAML');
      test.equal(testPost.meta.Title,        'Title');
      test.equal(testPost.meta.Description,  'Some nice text');
      test.equal(testPost.meta.Twitter,      '#Hashtag and some text');
      test.equal(testPost.meta.Language,     'en');
      test.equal(testPost.meta.Link,         'http://www.example.com/');
      test.done();
    })
    .catch(function() {
      test.ok(false, 'Parser should not fail');
      test.done();
    })
  ;
};
