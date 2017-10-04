'use strict';

exports.testGeneralFunctionality = function testGeneralFunctionality(test) {
  test.expect(3);

  const config      = require('../src/config');
  const imageStyles = require('../src/helpers/image-styles')(config);

  test.ok(imageStyles !== undefined, 'imageStyles is defined');
  test.ok(imageStyles.getFilename('test.jpg').match(/test-\d+x\d+\.jpg/), 'Converted filenames match nomenclatura of FILENAME-WIDTHxHEIGHT.SUFFIX');
  test.ok(imageStyles.replaceImgHtml('<img src="test.jpg#default" alt=""/>', 'replaceImgHtml is returning something'));

  //console.log(imageStyles.replaceImgHtml('<img src="test.jpg#default" alt=""/>'));
  test.done();
};

exports.testHtmlConversion = function testHtmlConversion(test) {
  test.expect(37);

  const config      = require('../src/config');
  const imageStyles = require('../src/helpers/image-styles')(config);
  let html;

  html = imageStyles.replaceImgHtml('<img src="test.jpg" alt="Example image"/>');
  test.ok(html, 'replaceImgHtml is returning something');
  test.ok(html.match(/test\.jpg"/),  'replaceImgHtml still contains image url');
  test.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
  test.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
  test.ok(html.match(/Example image/), 'replaceImgHtml has alt text');

  html = imageStyles.replaceImgHtml('<img src="http://www.example.com/test.jpg" alt="Example image"/>');
  test.ok(html, 'replaceImgHtml is returning something');
  test.ok(html.match(/test\.jpg"/),  'replaceImgHtml still contains image url');
  test.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
  test.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
  test.ok(html.match(/Example image/), 'replaceImgHtml has alt text');

  //console.log(html);

  html = imageStyles.replaceImgHtml('<img src="test.jpg#default" alt="Example image"/>');
  test.ok(html, 'replaceImgHtml is returning something');
  test.ok(html.match(/test\.jpg"/),  'replaceImgHtml still contains image url');
  test.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
  test.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
  test.ok(html.match(/Example image/), 'replaceImgHtml has alt text');
  test.ok(html.match(/srcset="/),    'replaceImgHtml has attribute srcset');
  test.ok(html.match(/sizes="/),     'replaceImgHtml has attribute sizes');
  test.ok(html.match(/width="/),     'replaceImgHtml has attribute width');
  test.ok(html.match(/height="/),    'replaceImgHtml has attribute height');
  test.ok(html.match(/test-[^"]+.jpg"/), 'replaceImgHtml has extra image urls');

  html = imageStyles.replaceImgHtml('<img src="test.png#default" alt="Example image"/>');
  test.ok(html, 'replaceImgHtml is returning something');
  test.ok(html.match(/test\.png"/),  'replaceImgHtml still contains image url');
  test.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
  test.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
  test.ok(html.match(/Example image/), 'replaceImgHtml has alt text');
  test.ok(html.match(/srcset="/),    'replaceImgHtml has attribute srcset');
  test.ok(html.match(/sizes="/),     'replaceImgHtml has attribute sizes');
  test.ok(html.match(/width="/),     'replaceImgHtml has attribute width');
  test.ok(html.match(/height="/),    'replaceImgHtml has attribute height');
  test.ok(html.match(/test-[^"]+.png"/), 'replaceImgHtml has extra image urls');

  //console.log(html);

  html = imageStyles.replaceImgHtml('<img src="test.jpg#320x240" alt="Example image"/>');
  test.ok(html, 'replaceImgHtml is returning something');
  test.ok(html.match(/test\.jpg"/),  'replaceImgHtml still contains image url');
  test.ok(html.match(/src="/),       'replaceImgHtml has attribute src');
  test.ok(html.match(/alt="/),       'replaceImgHtml has attribute alt');
  test.ok(html.match(/Example image/), 'replaceImgHtml has alt text');
  test.ok(html.match(/width="320/),    'replaceImgHtml has attribute width');
  test.ok(html.match(/height="240/),   'replaceImgHtml has attribute height');

  //console.log(html);

  test.done();
};
