'use strict';

exports.testGeneralFunctionality = function testGeneralFunctionality(test) {
  test.expect(3);

  var config      = require('../src/config');
  var imageStyles = require('../src/helpers/image-styles')(config);

  test.ok(imageStyles !== undefined, 'imageStyles is defined');
  test.ok(imageStyles.getFilename('test.jpg').match(/test-\d+x\d+\.jpg/), 'Converted filenames match nomenclatura of FILENAME-WIDTHxHEIGHT.SUFFIX');
  test.ok(imageStyles.replaceImgHtml('<img src="test.jpg#default" alt=""/>', 'replaceImgHtml is returning something'));

  //console.log(imageStyles.replaceImgHtml('<img src="test.jpg#default" alt=""/>'));
  test.done();
};
