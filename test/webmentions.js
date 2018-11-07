'use strict';

const assert = require('assert');
const webmentions = require('../lib/helpers/webmentions')();

describe('Webmentions', () => {
  it('should find external URLs', () => {
    let externalUrls;

    externalUrls = webmentions.findExternalLinks({});
    assert.equal(externalUrls.length, 0);

    externalUrls = webmentions.findExternalLinks({
      meta: {
        hasExternalLink: true,
        Link: '/internal'
      }
    });
    assert.equal(externalUrls.length, 0);

    externalUrls = webmentions.findExternalLinks({
      meta: {
        hasExternalLink: true,
        Link: 'https://www.example.com/'
      }
    });
    assert.equal(externalUrls.length, 1);
    assert.equal(externalUrls[0], 'https://www.example.com/');

    externalUrls = webmentions.findExternalLinks({
      meta: {
        hasExternalLink: true,
        Link: 'https://www.example.com/'
      },
      html: `I am a <a href="/internal">Link</a>.`
    });
    assert.equal(externalUrls.length, 1);
    assert.equal(externalUrls[0], 'https://www.example.com/');

    externalUrls = webmentions.findExternalLinks({
      meta: {
        hasExternalLink: true,
        Link: 'https://www.example.com/'
      },
      html: `I am a <a href="https://www.example.com/external">Link</a>.`
    });
    assert.equal(externalUrls.length, 2);
    assert.equal(externalUrls[0], 'https://www.example.com/');
    assert.equal(externalUrls[1], 'https://www.example.com/external');

    externalUrls = webmentions.findExternalLinks({
      html: `I am a <a href="https://www.example.com/external">Link</a>
      and <a href="https://www.example.com/external2">so am I</a>.`
    });
    assert.equal(externalUrls.length, 2);
    assert.equal(externalUrls[0], 'https://www.example.com/external');
    assert.equal(externalUrls[1], 'https://www.example.com/external2');

    externalUrls = webmentions.findExternalLinks({
      meta: {
        hasExternalLink: true,
        Link: 'https://www.example.com/identical'
      },
      html: `I am a <a href="https://www.example.com/identical">Link</a>.`
    });
    assert.equal(externalUrls.length, 1);
    assert.equal(externalUrls[0], 'https://www.example.com/identical');

    //console.log(externalUrls);
  });

  it('should ignore some external URLs', () => {
    let externalUrls;

    externalUrls = webmentions.findExternalLinks({
      meta: {
        NoWebmention: true,
        hasExternalLink: true,
        Link: 'https://www.example.com/'
      },
      html: `I am a <a href="https://www.example.com/external">Link</a>.`
    });
    assert.equal(externalUrls.length, 0);

    externalUrls = webmentions.findExternalLinks({
      meta: {
        hasExternalLink: true,
        Link: 'https://www.example.com/'
      },
      html: `I am a <a href="https://www.example.com/external" class="nomention">Link</a>.`
    });
    assert.equal(externalUrls.length, 1);
    assert.equal(externalUrls[0], 'https://www.example.com/');
  });

  it('should ignore external URLs from the black list', () => {
    let externalUrls;

    externalUrls = webmentions.findExternalLinks({
      meta: {
        hasExternalLink: true,
        Link: 'https://example.wikipedia.org/external2'
      },
      html: `I am a <a href="https://example.wikipedia.org/external">Link</a>.`
    });
    assert.equal(externalUrls.length, 0);

    externalUrls = webmentions.findExternalLinks({
      meta: {
        hasExternalLink: true,
        Link: 'http://localhost/'
      },
      html: `I am a <a href="http://fritz.box/">internal link</a>.`
    });
    assert.equal(externalUrls.length, 0);
  });

  const discoverUrls = [
    'https://webmention.rocks/test/1',
    'https://webmention.rocks/test/2',
    'https://webmention.rocks/test/3',
    'https://webmention.rocks/test/4',
    'https://webmention.rocks/test/5',
    'https://webmention.rocks/test/6',
    'https://webmention.rocks/test/7',
    'https://webmention.rocks/test/8',
    'https://webmention.rocks/test/9',
    'https://webmention.rocks/test/10',
    'https://webmention.rocks/test/11',
    'https://webmention.rocks/test/12',
    'https://webmention.rocks/test/13',
    'https://webmention.rocks/test/14',
    'https://webmention.rocks/test/15',
    'https://webmention.rocks/test/16',
    'https://webmention.rocks/test/17',
    'https://webmention.rocks/test/18',
    'https://webmention.rocks/test/19',
    'https://webmention.rocks/test/20',
    'https://webmention.rocks/test/21',
    'https://webmention.rocks/test/22',
    'https://webmention.rocks/test/23/page'
  ];
  discoverUrls.forEach(function(url) {
    it.skip('should discover endpoint URLs on test URL ' + url, function(done) {
      this.timeout(10000);
      webmentions
        .sendMentions('https://3960.org/sandbox/webmention.php', [url])
        .then(() => {
          // if (result >= 400) {
          //   result.forEach(function(r) {
          //     console.log(r, url);
          //   });
          // }
          assert.ok(true);
        })
        .catch(() => {
          assert.ok(false);
        })
        .then(done, done)
      ;
    });
  });
});
