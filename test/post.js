var Post = require('../src/models/post');

exports.testErrors = function(test) {
  'use strict';
  test.expect(5);


  test.throws(function() {new Post();}, Error);
  test.throws(function() {new Post('test.md');}, Error);
  test.throws(function() {new Post('test.md', 'Test');}, Error);
  test.throws(function() {new Post('test.md', 'Test', {});}, Error);
  test.doesNotThrow(function() {new Post('test.md', 'Test', {
    Description: 'Description',
    Date: new Date()
  });}, Error);

  test.done();
};

exports.testStructure = function(test) {
  'use strict';
  test.expect(20+3);

  var testPost = new Post('test.md', 'Test', {
    Description: 'Description',
    Date: new Date()
  });

  test.ok(testPost.markdown);
  test.ok(testPost.share);
  test.ok(testPost.share.twitter);
  test.ok(testPost.meta);
  test.ok(testPost.meta.Description);
  test.ok(testPost.meta.Language);
  test.ok(testPost.meta.Date);
  test.ok(testPost.meta.DateModified);
  test.ok(testPost.meta.Url);
  test.ok(testPost.meta.AbsoluteUrl);
  test.ok(testPost.hash);
  test.ok(testPost.hash.match(/^[a-z0-9]+$/));
  test.ok(testPost.html);
  test.ok(testPost.html === '<p>Test</p>');
  test.ok(testPost.htmlTeaser);
  test.ok(testPost.htmlTeaser === '<p>Description</p>');
  test.ok(testPost.safeHtml);
  test.ok(testPost.html === '<p>Test</p>');
  test.ok(testPost.safeHtmlTeaser);
  test.ok(testPost.safeHtmlTeaser === '<p>Description</p>');
  test.ok(testPost.ampHtml());
  test.ok(testPost.ampHtmlTeaser());
  test.ok(String(testPost) === testPost.hash);
  test.done();
};
