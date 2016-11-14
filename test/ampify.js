var ampify = require('../src/helpers/ampify')();

exports.testAmpifyBasic = function testAmpifyBasic(test) {
  'use strict';
  test.expect(1);

  var html = '<img src="#" alt="" />';
  test.equal(ampify.ampifyHtml(html), '<amp-img src="#" alt=""></amp-img>');

  test.done();
};
