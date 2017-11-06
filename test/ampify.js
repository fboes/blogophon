'use strict';

const ampify = require('../lib/helpers/ampify')();

exports.testAmpifyBasic = function testAmpifyBasic(test) {
  test.expect(1);

  const html = '<img src="#" alt="" />';
  test.equal(ampify.ampifyHtml(html), '<amp-img layout="responsive" src="#" alt=""></amp-img>');

  test.done();
};

exports.testAmpifyVideo = function testAmpifyBasic(test) {
  test.expect(3+6);

  let html = '<div class="video-player youtube"><iframe allowfullscreen="allowfullscreen" src="https://www.youtube-nocookie.com/embed/BLKBe5P-Mfw?enablejsapi=1"></iframe><!-- img src="https://img.youtube.com/vi/BLKBe5P-Mfw/hqdefault.jpg" --></div>';
  html += "\n";
  html += '<div class="video-player vimeo"><iframe allowfullscreen="allowfullscreen" src="https://player.vimeo.com/video/108650530"></iframe></div>';
  html += "\n";
  html += '<div>Before iFrame 1 <iframe src="http://www.example.com"></iframe> behin iFrame 1</div>';
  html += '<div class="embed embed--codepen">Before iFrame 2 <iframe allowfullscreen="allowfullscreen" src="//codepen.io/fboes/embed/wJQpJQ/?height=265&amp;theme-id=0&amp;default-tab=result&amp;embed-version=2" height="265" scrolling="no"></iframe> behind iFrame 2</div>';
  let ampHtml = ampify.ampifyHtml(html);

  //console.log(ampHtml);
  test.ok(ampHtml.match(/<amp-youtube/));
  test.ok(ampHtml.match(/<amp-vimeo/));
  test.ok(ampHtml.match(/<amp-iframe/));

  let ampProperties = ampify.ampifyProperties(ampHtml);
  //console.log(ampProperties);
  test.ok(ampProperties);
  test.ok(ampProperties.hasIframe);
  test.ok(ampProperties.hasYoutube);
  test.ok(ampProperties.hasVimeo);
  test.ok(!ampProperties.hasVideo);
  test.ok(!ampProperties.hasAudio);

  test.done();
};
