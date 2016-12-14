'use strict';

var ampify = require('../src/helpers/ampify')();

exports.testAmpifyBasic = function testAmpifyBasic(test) {
  test.expect(2);

  var html = '<img src="#" alt="" />';
  test.equal(ampify.ampifyHtml(html), '<amp-img layout="responsive" src="#" alt=""></amp-img>');

  html = '<img src="image-320x200.jpg" alt="" />';
  test.equal(ampify.ampifyHtml(html), '<amp-img layout="responsive" src="image-320x200.jpg" width="320" height="200" alt=""></amp-img>');

  test.done();
};
