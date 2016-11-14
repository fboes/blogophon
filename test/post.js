var post = require('../src/models/post');
var config = require('../src/config');

exports.testErrors = function(test) {
  'use strict';
  test.expect(5);


  test.throws(function() {post();}, Error);
  test.throws(function() {post('test.md');}, Error);
  test.throws(function() {post('test.md', 'Test');}, Error);
  test.throws(function() {post('test.md', 'Test', {});}, Error);
  test.doesNotThrow(function() {post('test.md', 'Test', {
    Description: 'Description',
    Date: new Date()
  }, config);}, Error);

  test.done();
};

exports.testStructure = function(test) {
  'use strict';
  test.expect(17);

  var testPost = post('test.md', 'Test', {
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
  test.equal(testPost.html, '<p>Test</p>');
  test.ok(testPost.htmlTeaser);
  test.equal(testPost.htmlTeaser, '<p>Description</p>');
  test.equal(String(testPost), testPost.hash);
  test.done();
};

/**
 * Find all image references to local images in Markdown and return this with corresponding styles.
 * @param  {[type]} test [description]
 */
exports.testImageParser = function(test) {
  'use strict';
  test.expect(12);

  var testPost = post('test.md', 'Single image with style: ![](markdown.jpg#default) - and without style: ![](markdown.jpg) - and remote image ![](http://www.example.com/remote.jpg)', {
    Description: 'Single image with style: ![](description.jpg#default) - and without style: ![](description.jpg)',
    Date: new Date()
  });

  test.ok(testPost.markdown);
  test.ok(testPost.meta.MarkdownDescription);

  var imageStyles = testPost.getAllImagesWithStyle();
  //console.log(imageStyles);
  test.equal(imageStyles[0].filename, 'description.jpg');
  test.equal(imageStyles[0].style,    'default');
  test.equal(imageStyles[1].filename, 'description.jpg');
  test.equal(imageStyles[1].style,    null);
  test.equal(imageStyles[2].filename, 'markdown.jpg');
  test.equal(imageStyles[2].style,    'default');
  test.equal(imageStyles[3].filename, 'markdown.jpg');
  test.equal(imageStyles[3].style,    null);

  imageStyles = testPost.getAllImagesWithStyleObject();
  //console.log(imageStyles);
  test.ok(imageStyles['description.jpg']);
  test.ok(imageStyles['markdown.jpg']);

  test.done();
};

/*
exports.testSpecialProperties = function(test) {
  'use strict';

  var testPost = post('test.md', 'Test', {
    Description: 'Description',
    Date: new Date()
  });

  if (config.specialFeatures.acceleratedmobilepages) {
    test.ok(testPost.safeHtmlTeaser);
    test.ok(testPost.safeHtmlTeaser === '<p>Description</p>');
  }
  if (config.specialFeatures.jsonrss || config.specialFeatures.atom || config.specialFeatures.rss) {
    test.ok(testPost.ampHtml);
    test.ok(testPost.ampHtmlTeaser === '<p>Description</p>');
  }

  test.done();
}
*/
