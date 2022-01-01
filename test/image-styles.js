import assert from 'assert';
import configJs from '../lib/config.js';
import imageStylesJs from '../lib/helpers/image-styles.js';

describe('Image Styles', function() {
  const config = configJs();
  const imageStyles = imageStylesJs(config);

  it('should test GeneralFunctionality', function() {
    assert.ok(imageStyles !== undefined, 'imageStyles is defined');
    assert.ok(
      imageStyles.getFilename('test.jpg').match(/test-\d+x\d+\.jpg/),
      'Converted filenames match nomenclatura of FILENAME-WIDTHxHEIGHT.SUFFIX'
    );
    assert.ok(
      imageStyles.replaceImgHtml(
        '<img src="test.jpg#default" alt=""/>',
        'replaceImgHtml is returning something'
      )
    );

    //console.log(imageStyles.replaceImgHtml('<img src="test.jpg#default" alt=""/>'));
  });

  it('should test HtmlConversion', function() {
    let html;

    html = imageStyles.replaceImgHtml('<img src="test.jpg" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.match(html, /test\.jpg"/,  'replaceImgHtml still contains image url');
    assert.match(html, /src="/,       'replaceImgHtml has attribute src');
    assert.match(html, /alt="/,       'replaceImgHtml has attribute alt');
    assert.match(html, /Example image/, 'replaceImgHtml has alt text');
    assert.doesNotMatch(html, /--aspect-ratio/,   'replaceImgHtml has no aspect ratio');

    html = imageStyles.replaceImgHtml('<img src="http://www.example.com/test.jpg" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.match(html, /test\.jpg"/,  'replaceImgHtml still contains image url');
    assert.match(html, /src="/,       'replaceImgHtml has attribute src');
    assert.match(html, /alt="/,       'replaceImgHtml has attribute alt');
    assert.match(html, /Example image/, 'replaceImgHtml has alt text');
    assert.doesNotMatch(html, /--aspect-ratio/,   'replaceImgHtml has no aspect ratio');

    //console.log(html);

    html = imageStyles.replaceImgHtml('<img src="test.jpg#default" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.match(html, /test\.jpg"/,  'replaceImgHtml still contains image url');
    assert.match(html, /src="/,       'replaceImgHtml has attribute src');
    assert.match(html, /alt="/,       'replaceImgHtml has attribute alt');
    assert.match(html, /Example image/, 'replaceImgHtml has alt text');
    assert.match(html, /srcset="/,    'replaceImgHtml has attribute srcset');
    assert.match(html, /sizes="/,     'replaceImgHtml has attribute sizes');
    assert.match(html, /width="/,     'replaceImgHtml has attribute width');
    assert.match(html, /height="/,    'replaceImgHtml has attribute height');
    assert.match(html, /test-[^"]+.jpg"/, 'replaceImgHtml has extra image urls');
    assert.match(html, /--aspect-ratio:/,   'replaceImgHtml has aspect ratio');

    html = imageStyles.replaceImgHtml('<img src="test.png#default" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.match(html, /test\.png"/,  'replaceImgHtml still contains image url');
    assert.match(html, /src="/,       'replaceImgHtml has attribute src');
    assert.match(html, /alt="/,       'replaceImgHtml has attribute alt');
    assert.match(html, /Example image/, 'replaceImgHtml has alt text');
    assert.match(html, /srcset="/,    'replaceImgHtml has attribute srcset');
    assert.match(html, /sizes="/,     'replaceImgHtml has attribute sizes');
    assert.match(html, /width="/,     'replaceImgHtml has attribute width');
    assert.match(html, /height="/,    'replaceImgHtml has attribute height');
    assert.match(html, /test-[^"]+.png"/, 'replaceImgHtml has extra image urls');
    assert.match(html, /--aspect-ratio:/,   'replaceImgHtml has aspect ratio');

    //console.log(html);

    html = imageStyles.replaceImgHtml('<img src="test.jpg#320x240" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.match(html, /test\.jpg"/,  'replaceImgHtml still contains image url');
    assert.match(html, /src="/,       'replaceImgHtml has attribute src');
    assert.match(html, /alt="/,       'replaceImgHtml has attribute alt');
    assert.match(html, /Example image/, 'replaceImgHtml has alt text');
    assert.match(html, /width="320/,    'replaceImgHtml has attribute width');
    assert.match(html, /height="240/,   'replaceImgHtml has attribute height');
    assert.match(html, /--aspect-ratio: 4\/3/,   'replaceImgHtml has aspect ratio');

    //console.log(html);
  });
});
