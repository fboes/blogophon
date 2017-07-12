'use strict';

var post = require('../src/models/post');
var config = require('../src/config');

exports.testErrors = function(test) {
  test.expect(5);


  test.throws(function() {
    post();
  }, Error);
  test.throws(function() {
    post('test.md');
  }, Error);
  test.throws(function() {
    post('test.md', 'Test');
  }, Error);
  test.throws(function() {
    post('test.md', 'Test', {});
  }, Error);
  test.doesNotThrow(function() {
    post('test.md', 'Test', {
      Description: 'Description',
      Date: new Date()
    }, config);
  }, Error);

  test.done();
};

exports.testStructure = function(test) {
  test.expect(21);

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
  test.ok(testPost.meta.Link);
  test.ok(testPost.meta.AbsoluteLink);
  test.ok(testPost.hash);
  test.ok(testPost.hash.match(/^[a-z0-9]+$/));
  test.ok(testPost.html);
  test.equal(testPost.html, '<p>Test</p>');
  test.ok(testPost.htmlTeaser);
  test.equal(testPost.htmlTeaser, '<p>Description</p>');
  test.equal(String(testPost), testPost.hash);
  test.equal(testPost.meta.Url, testPost.meta.Link);
  test.equal(testPost.meta.AbsoluteUrl, testPost.meta.AbsoluteLink);
  test.done();
};

exports.testReplacingMarkdown = function(test) {
  test.expect(10);

  var testMarkdown = 'Text ![](some-image.jpg) and [some internal link](internal.md).';
  var testMarkdownDescription = 'Description ![](some-image.jpg) and [some internal link](internal.md).';
  var testMeta = {
    Description: testMarkdownDescription,
    Date: new Date()
  };
  var testPost = post('test.md', testMarkdown, testMeta);

  //console.log(testPost);

  test.equal(testPost.markdown, testMarkdown, 'Input markdown equals output markdown');
  test.equal(testPost.meta.Description, 'Description  and some internal link.', 'Description has no markdown');
  test.equal(testPost.meta.MarkdownDescription, testMarkdownDescription, '...but there is a description with markdown');
  test.ok(testPost.meta.Image.match(/some-image.jpg/));
  test.ok(testPost.meta.ProperImage.match(/some-image.jpg/));
  test.ok(testPost.html.match(/test\/some-image.jpg/), 'Image has path added');
  test.ok(testPost.htmlTeaser.match(/test\/some-image.jpg/), 'Image has path added');
  test.ok(!testPost.html.match(/internal\.md/), 'Internal links are converted');
  test.ok(!testPost.htmlTeaser.match(/internal\.md/), 'Internal links are converted');
  test.ok(!testPost.meta.Title.match(/\[/), 'Links are removed from title');

  test.done();
};

/**
 * Find all image references to local images in Markdown and return this with corresponding styles.
 * @param  {Test} test [description]
 * @return {void}      [description]
 */
exports.testImageParser = function(test) {
  test.expect(13);

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
  test.ok(testPost.html.match(/src="http:\/\/www\.example\.com\/remote\.jpg"/));

  test.done();
};

exports.testGallery = function(test) {
  test.expect(4);

  var filename = 'test.md';
  var markdown;
  var testPost;

  markdown = '![alt1](img1-64x48.jpg)';
  testPost = post(filename, markdown, {
    Description: 'None',
    Date: new Date(),
    Classes: 'images'
  });
  test.ok(!testPost.html.match(/<div class="gallery/));

  markdown = '![alt1](img1-64x48.jpg) ![alt2](img2-64x48.jpg) ![alt3](img3-64x48.jpg)';
  testPost = post(filename, markdown, {
    Description: 'None',
    Date: new Date(),
    Classes: 'images'
  });
  test.ok(testPost.html.match(/<div class="gallery/));

  markdown = '![alt1](img1-64x48.jpg) ![alt2](img2-32x24.jpg) ![alt3](img3-64x48.jpg)';
  testPost = post(filename, markdown, {
    Description: 'None',
    Date: new Date(),
    Classes: 'images'
  });
  test.ok(testPost.html.match(/<div class="gallery/));

  markdown = '![alt1](img1-64x48.jpg) ![alt2](img2-32x24.jpg) ![alt3](img3-64x48.jpg)';
  testPost = post(filename, markdown, {
    Description: 'None',
    Date: new Date()
  });
  test.ok(!testPost.html.match(/<div class="gallery/));

  test.done();
};

exports.testLinks = function(test) {
  test.expect(3);

  var markdown = 'www.1test.com will not be found'
    + 'But [this link](http://www.2test.com) will be found.'
    + 'As will be [this link](https://www.3test.com).'
    + 'An ![image](https://www.4test.com) should not be found.'
    + 'As will be [this link](https://www.5test.com/some-compilcated-foo?a#b).'
  ;
  var testLinks = post('test.md', markdown, {
    Description: 'None',
    Date: new Date()
  }).getAllExternalLinks();

  //console.log(testLinks);

  test.equal(testLinks[0],    'http://www.2test.com');
  test.equal(testLinks[1],    'https://www.3test.com');
  test.equal(testLinks[2],    'https://www.5test.com/some-compilcated-foo?a#b');

  test.done();
};


/*
exports.testSpecialProperties = function(test) {

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
