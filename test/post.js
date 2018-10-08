'use strict';

const assert = require('assert');
const post = require('../lib/models/post');
const config = require('../lib/config')(__dirname);

describe('Post', function() {
  it('must thor errors on broken posts', function() {
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

  it('must have a bunch of properties', function() {
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

  it('must convert Markdown into HTML', function() {
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

  it('must find images', function() {
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

  it('must also build proper galleries', function() {
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

  it('must find external links', function() {
    const markdown = `www.1test.com _will_ be found as of \`marked@0.3.15\`
And [this link](http://www.2test.com) will be found.
As will be [this link](https://www.3test.com).
An ![image](https://www.4test.com) must not be found.
As will be [this link](https://www.5test.com/some-compilcated-foo?a#b).
But not example.6test.com or 7test.com (URLs with subdomains without proper links)`
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

  it('must convert internal links', function() {
    const markdown = `This is an [internal link](internal-link.md), as is [this](internal-link2/index.md) and [this](../internal-link3/index.md).`;
    const testPost = post('test.md', markdown, {
      Description: 'Description',
      Date: new Date()
    });
    const testLinks = testPost.getAllExternalLinks();
    //console.log(testPost.html);

    assert.equal(testLinks.length, 0);
    assert.ok(testPost.html.match(/\/posts\/internal-link\//));
    assert.ok(testPost.html.match(/\/posts\/internal-link2\//));
    assert.ok(testPost.html.match(/\/posts\/internal-link3\//));
  });

  it('must do proper headlining', function() {
    const markdown = `Title
=======

Title 2
-------

## Title 2 too

### More Tütle 2

#### More Title 3!

##### More T#tle 4
`;
    const testPost = post('test.md', markdown, {
      Description: 'Description',
      Date: new Date()
    });

    assert.ok(!testPost.html.match(/<h1/g), 'Removes <h1> from article');
    assert.equal(testPost.html.match(/<h2 id="/g).length,               2);
    assert.equal(testPost.html.match(/<h3 id="more-t-tle-2"/g).length,  1);
    assert.equal(testPost.html.match(/<h4 id="more-title-3-"/g).length, 1);
    assert.equal(testPost.html.match(/<h5 id="more-t-tle-4"/g).length,  1);
  });

  it('must properly convert Markdown tables into HTML', function() {
    const markdown = `##### Tic Tac Toe

| \\    | A   | B   | C   |
| ----- | --- | --- | --- |
| **1** | X   | X   | X   |
| **2** | O   | X   |     |
| **3** |     | O   | O   |


##### Centred tables

| \\    | A   | B   | C   |
| ----- |:--- |:---:| ---:|
| **1** | X   | X   | X   |
| **2** | O   | X   |     |
| **3** |     | O   | O   |
`;
    const testPost = post('test.md', markdown, {
      Description: 'Description',
      Date: new Date()
    });
    //console.log(testPost.html);

    assert.equal(testPost.html.match(/<caption id="/g).length, 2);
    assert.equal(testPost.html.match(/<th>/g).length,          5);
    assert.equal(testPost.html.match(/<th(?:>|\s)/g).length,   14);
    assert.equal(testPost.html.match(/<thead/g).length,        2);
    assert.equal(testPost.html.match(/<tbody/g).length,        2);
    assert.equal(testPost.html.match(/text-align/g).length,    12);
    assert.equal(testPost.html.match(/table-cell--/g).length,  3);
  });
});
