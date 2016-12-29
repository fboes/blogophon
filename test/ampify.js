'use strict';

var ampify = require('../src/helpers/ampify')();

exports.testAmpifyBasic = function testAmpifyBasic(test) {
  test.expect(1);

  var html = '<img src="#" alt="" />';
  test.equal(ampify.ampifyHtml(html), '<amp-img layout="responsive" src="#" alt=""></amp-img>');

  test.done();
};
