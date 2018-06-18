'use strict';

const assert = require('assert');
const post = require('../lib/models/post');
const config = require('../lib/config');

describe('Post', function() {
  it('should test Errors', function() {

    assert.throws(function() {
      post();
    }, Error);
    assert.throws(function() {
      post('test.md');
    }, Error);
    assert.throws(function() {
      post('test.md', 'Test');
    }, Error);
    assert.throws(function() {
      post('test.md', 'Test', {});
    }, Error);
    assert.doesNotThrow(function() {
      post('test.md', 'Test', {
        Description: 'Description',
        Date: new Date()
      }, config);
    }, Error);
  });

  it('should test Structure', function() {
    let testPost = post('test.md', 'Test', {
      Description: 'Description',
      Date: new Date()
    });

    assert.ok(testPost.markdown);
    assert.ok(testPost.share);
    assert.ok(testPost.share.twitter);
    assert.ok(testPost.meta);
    assert.ok(testPost.meta.Description);
    assert.ok(testPost.meta.Language);
    assert.ok(testPost.meta.Date);
    assert.ok(testPost.meta.DateModified);
    assert.ok(testPost.meta.Url);
    assert.ok(testPost.meta.AbsoluteUrl);
    assert.ok(testPost.meta.Link);
    assert.ok(testPost.meta.AbsoluteLink);
    assert.ok(testPost.hash);
    assert.ok(testPost.hash.match(/^[a-z0-9]+$/));
    assert.ok(testPost.html);
    assert.equal(testPost.html, '<p>Test</p>');
    assert.ok(testPost.htmlTeaser);
    assert.equal(testPost.htmlTeaser, '<p>Description</p>');
    assert.equal(String(testPost), testPost.hash);
    assert.equal(testPost.meta.Url, testPost.meta.Link);
    assert.equal(testPost.meta.AbsoluteUrl, testPost.meta.AbsoluteLink);
  });

  it('should test ReplacingMarkdown', function() {
    let testMarkdown = 'Text ![](some-image.jpg) and [some internal link](internal.md).';
    let testMarkdownDescription = 'Description ![](some-image.jpg) and [some internal link](internal.md).';
    let testMeta = {
      Description: testMarkdownDescription,
      Date: new Date()
    };
    let testPost = post('test.md', testMarkdown, testMeta);

    //console.log(testPost);

    assert.equal(testPost.markdown, testMarkdown, 'Input markdown equals output markdown');
    assert.equal(testPost.meta.Description, 'Description  and some internal link.', 'Description has no markdown');
    assert.equal(testPost.meta.MarkdownDescription, testMarkdownDescription, '...but there is a description with markdown');
    assert.ok(testPost.meta.Image.match(/some-image.jpg/));
    assert.ok(testPost.meta.ProperImage.match(/some-image.jpg/));
    assert.ok(testPost.html.match(/test\/some-image.jpg/), 'Image has path added');
    assert.ok(testPost.htmlTeaser.match(/test\/some-image.jpg/), 'Image has path added');
    assert.ok(!testPost.html.match(/internal\.md/), 'Internal links are converted');
    assert.ok(!testPost.htmlTeaser.match(/internal\.md/), 'Internal links are converted');
    assert.ok(!testPost.meta.Title.match(/\[/), 'Links are removed from title');
  });

  it('should test ImageParser', function() {
    let testPost = post('test.md', 'Single image with style: ![](markdown.jpg#default) - and without style: ![](markdown.jpg) - and remote image ![](http://www.example.com/remote.jpg)', {
      Description: 'Single image with style: ![](description.jpg#default) - and without style: ![](description.jpg)',
      Date: new Date()
    });

    assert.ok(testPost.markdown);
    assert.ok(testPost.meta.MarkdownDescription);

    let imageStyles = testPost.getAllImagesWithStyle();
    //console.log(imageStyles);
    assert.equal(imageStyles[0].filename, 'description.jpg');
    assert.equal(imageStyles[0].style,    'default');
    assert.equal(imageStyles[1].filename, 'description.jpg');
    assert.equal(imageStyles[1].style,    null);
    assert.equal(imageStyles[2].filename, 'markdown.jpg');
    assert.equal(imageStyles[2].style,    'default');
    assert.equal(imageStyles[3].filename, 'markdown.jpg');
    assert.equal(imageStyles[3].style,    null);

    imageStyles = testPost.getAllImagesWithStyleObject();
    //console.log(imageStyles);
    assert.ok(imageStyles['description.jpg']);
    assert.ok(imageStyles['markdown.jpg']);
    assert.ok(testPost.html.match(/src="http:\/\/www\.example\.com\/remote\.jpg"/));
  });

  it('should test Gallery', function() {
    let filename = 'test.md';
    let markdown;
    let testPost;

    markdown = '![alt1](img1-64x48.jpg)';
    testPost = post(filename, markdown, {
      Description: 'None',
      Date: new Date(),
      Classes: 'images'
    });
    assert.ok(!testPost.html.match(/<div class="gallery/));

    markdown = '![alt1](img1-64x48.jpg) ![alt2](img2-64x48.jpg) ![alt3](img3-64x48.jpg)';
    testPost = post(filename, markdown, {
      Description: 'None',
      Date: new Date(),
      Classes: 'images'
    });
    assert.ok(testPost.html.match(/<div class="gallery/));

    markdown = '![alt1](img1-64x48.jpg) ![alt2](img2-32x24.jpg) ![alt3](img3-64x48.jpg)';
    testPost = post(filename, markdown, {
      Description: 'None',
      Date: new Date(),
      Classes: 'images'
    });
    assert.ok(testPost.html.match(/<div class="gallery/));

    markdown = '![alt1](img1-64x48.jpg) ![alt2](img2-32x24.jpg) ![alt3](img3-64x48.jpg)';
    testPost = post(filename, markdown, {
      Description: 'None',
      Date: new Date()
    });
    assert.ok(!testPost.html.match(/<div class="gallery/));
  });

  it('should test Links', function() {
    const markdown = 'www.1test.com _will_ be found as of `marked@0.3.15` '
    + 'And [this link](http://www.2test.com) will be found.'
    + 'As will be [this link](https://www.3test.com).'
    + 'An ![image](https://www.4test.com) should not be found.'
    + 'As will be [this link](https://www.5test.com/some-compilcated-foo?a#b).'
    + 'But not example.6test.com or 7test.com (URLs with subdomains without proper links)'
  ;
    const html = post('test.md', markdown, {
      Description: 'None',
      Date: new Date()
    });
    const testLinks = html.getAllExternalLinks();

    //console.log(testLinks);

    assert.equal(testLinks.length, 4);
    assert.equal(testLinks[0],    'http://www.1test.com');
    assert.equal(testLinks[1],    'http://www.2test.com');
    assert.equal(testLinks[2],    'https://www.3test.com');
    assert.equal(testLinks[3],    'https://www.5test.com/some-compilcated-foo?a#b');
  });


/*
  it('should test SpecialProperties', function() {
    var testPost = post('test.md', 'Test', {
      Description: 'Description',
      Date: new Date()
    });

    if (config.specialFeatures.acceleratedmobilepages) {
      assert.ok(testPost.safeHtmlTeaser);
      assert.ok(testPost.safeHtmlTeaser === '<p>Description</p>');
    }
    if (config.specialFeatures.jsonrss || config.specialFeatures.atom || config.specialFeatures.rss) {
      assert.ok(testPost.ampHtml);
      assert.ok(testPost.ampHtmlTeaser === '<p>Description</p>');
    }
  });
*/
});
