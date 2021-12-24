import assert from 'assert';
import ampify from '../lib/helpers/ampify.js';

describe('Ampify', function() {
  describe('Images', function() {
    it('should replace <img> with <amp-img>', function() {
      let html    = '<img src="#" alt="" />';
      let ampHtml = ampify.ampifyHtml(html);
      assert.strictEqual(ampHtml, '<amp-img layout="responsive" src="#" alt=""></amp-img>');
    });


    it('should replace treat SVGs differently', function() {
      let html    = '<img src="test.svg" alt="" />';
      let ampHtml = ampify.ampifyHtml(html);
      assert.strictEqual(ampHtml, '<amp-img layout="intrinsic" src="test.svg" alt=""></amp-img>');
    });
  });

  describe('Videos', function() {
    let html = '<div class="video-player youtube"><iframe allowfullscreen="allowfullscreen" src="https://www.youtube-nocookie.com/embed/BLKBe5P-Mfw?enablejsapi=1"></iframe><!-- img src="https://img.youtube.com/vi/BLKBe5P-Mfw/hqdefault.jpg" --></div>';
    html += "\n";
    html += '<div class="video-player vimeo"><iframe allowfullscreen="allowfullscreen" src="https://player.vimeo.com/video/108650530"></iframe></div>';
    html += "\n";
    html += '<div>Before iFrame 1 <iframe src="http://www.example.com"></iframe> behind iFrame 1</div>';
    html += '<div class="embed embed--codepen">Before iFrame 2 <iframe allowfullscreen="allowfullscreen" src="//codepen.io/fboes/embed/wJQpJQ/?height=265&amp;theme-id=0&amp;default-tab=result&amp;embed-version=2" height="265" scrolling="no"></iframe> behind iFrame 2</div>';
    let ampHtml = ampify.ampifyHtml(html);
    let ampProperties = ampify.ampifyProperties(ampHtml);

    //console.log(ampHtml);
    //console.log(ampProperties);

    it('should replace Youtube videos with <amp-youtube>', function() {
      assert.ok(ampHtml.match(/<amp-youtube/));
    });
    it('should replace Vimeo videos with <amp-vimeo>', function() {
      assert.ok(ampHtml.match(/<amp-vimeo/));
    });
    it('should replace iframes with <amp-iframe>', function() {
      assert.ok(ampHtml.match(/<amp-iframe/));
    });
    it('should have no `srcdoc`', function() {
      assert.ok(!ampHtml.match(/srcdoc="/));
    });
    it('should have properties if some feature was used in HTML', function() {
      assert.ok(ampProperties);
      assert.ok(ampProperties.hasIframe);
      assert.ok(ampProperties.hasYoutube);
      assert.ok(ampProperties.hasVimeo);
      assert.ok(!ampProperties.hasVideo);
      assert.ok(!ampProperties.hasAudio);
    });
  });
});
