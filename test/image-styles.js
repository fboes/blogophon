'use strict';

const assert = require('assert');

describe('Image Styles', function() {
  it('should test GeneralFunctionality', function() {
    const config      = require('../lib/config')();
    const imageStyles = require('../lib/helpers/image-styles')(config);

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
    const config      = require('../lib/config')();
    const imageStyles = require('../lib/helpers/image-styles')(config);
    let html;

    html = imageStyles.replaceImgHtml('<img src="test.jpg" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.ok(html.match(/test\.jpg"/),  'replaceImgHtml still contains image url');
    assert.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
    assert.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
    assert.ok(html.match(/Example image/), 'replaceImgHtml has alt text');

    html = imageStyles.replaceImgHtml('<img src="http://www.example.com/test.jpg" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.ok(html.match(/test\.jpg"/),  'replaceImgHtml still contains image url');
    assert.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
    assert.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
    assert.ok(html.match(/Example image/), 'replaceImgHtml has alt text');

    //console.log(html);

    html = imageStyles.replaceImgHtml('<img src="test.jpg#default" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.ok(html.match(/test\.jpg"/),  'replaceImgHtml still contains image url');
    assert.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
    assert.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
    assert.ok(html.match(/Example image/), 'replaceImgHtml has alt text');
    assert.ok(html.match(/srcset="/),    'replaceImgHtml has attribute srcset');
    assert.ok(html.match(/sizes="/),     'replaceImgHtml has attribute sizes');
    assert.ok(html.match(/width="/),     'replaceImgHtml has attribute width');
    assert.ok(html.match(/height="/),    'replaceImgHtml has attribute height');
    assert.ok(html.match(/test-[^"]+.jpg"/), 'replaceImgHtml has extra image urls');

    html = imageStyles.replaceImgHtml('<img src="test.png#default" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.ok(html.match(/test\.png"/),  'replaceImgHtml still contains image url');
    assert.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
    assert.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
    assert.ok(html.match(/Example image/), 'replaceImgHtml has alt text');
    assert.ok(html.match(/srcset="/),    'replaceImgHtml has attribute srcset');
    assert.ok(html.match(/sizes="/),     'replaceImgHtml has attribute sizes');
    assert.ok(html.match(/width="/),     'replaceImgHtml has attribute width');
    assert.ok(html.match(/height="/),    'replaceImgHtml has attribute height');
    assert.ok(html.match(/test-[^"]+.png"/), 'replaceImgHtml has extra image urls');

    //console.log(html);

    html = imageStyles.replaceImgHtml('<img src="test.jpg#320x240" alt="Example image"/>');
    assert.ok(html, 'replaceImgHtml is returning something');
    assert.ok(html.match(/test\.jpg"/),  'replaceImgHtml still contains image url');
    assert.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
    assert.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
    assert.ok(html.match(/Example image/), 'replaceImgHtml has alt text');
    assert.ok(html.match(/width="320/),    'replaceImgHtml has attribute width');
    assert.ok(html.match(/height="240/),   'replaceImgHtml has attribute height');

    //console.log(html);
  });
});
