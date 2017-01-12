'use strict';

var ampify = require('../src/helpers/ampify')();

exports.testAmpifyBasic = function testAmpifyBasic(test) {
  test.expect(1);

  var html = '<img src="#" alt="" />';
  test.equal(ampify.ampifyHtml(html), '<amp-img layout="responsive" src="#" alt=""></amp-img>');

  test.done();
};

exports.testAmpifyVideo = function testAmpifyBasic(test) {
  test.expect(3+6);

  var html = '<div class="video-player youtube"><iframe allowfullscreen="allowfullscreen" src="https://www.youtube-nocookie.com/embed/BLKBe5P-Mfw?enablejsapi=1"></iframe><!-- img src="https://img.youtube.com/vi/BLKBe5P-Mfw/hqdefault.jpg" --></div>';
  html += "\n";
  html += '<div class="video-player vimeo"><iframe allowfullscreen="allowfullscreen" src="https://player.vimeo.com/video/108650530"></iframe></div>';
  html += "\n";
  html += '<div><iframe src="http://www.example.com"></iframe></div>';
  var ampHtml = ampify.ampifyHtml(html);


  test.ok(ampHtml.match(/<amp\-youtube/));
  test.ok(ampHtml.match(/<amp\-vimeo/));
  test.ok(ampHtml.match(/<amp\-iframe/));

  var ampProperties = ampify.ampifyProperties(ampHtml);
  //console.log(ampProperties);
  test.ok(ampProperties);
  test.ok(ampProperties.hasIframe);
  test.ok(ampProperties.hasYoutube);
  test.ok(ampProperties.hasVimeo);
  test.ok(!ampProperties.hasVideo);
  test.ok(!ampProperties.hasAudio);

  test.done();
};
