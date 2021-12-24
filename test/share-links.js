
import assert from 'assert';
import shareLink from '../lib/helpers/share-links.js';

describe('Share-Links', function() {
  it('should have basic properties', function() {
    const share = shareLink(1, 2, 3, 4);

    assert.ok(share.twitter);
    assert.ok(share.facebook);
    assert.ok(share.gplus);
    assert.ok(share.whatsapp);
    assert.ok(share.email);
  });

  it('should have basic properties', function() {
    let testData = {
      title: 'Gollum',
      link: 'www.example.com',
      description: 'Mordor',
      siteName: 'MiddleEarth'
    };
    let share = shareLink(testData.title, testData.link, testData.description, testData.siteName);

    let testMatch = {
      title: function(str) {
        return str.match(new RegExp(testData.title));
      },
      link: function(str) {
        return str.match(new RegExp(testData.link));
      },
      description: function(str) {
        return str.match(new RegExp(testData.description));
      },
      siteName: function(str) {
        return str.match(new RegExp(testData.siteName));
      }
    };

    assert.ok(share.twitter);
    assert.ok(testMatch.link(share.twitter));
    assert.ok(testMatch.description(share.twitter));

    assert.ok(share.facebook);
    assert.ok(testMatch.link(share.facebook));

    assert.ok(share.gplus);
    assert.ok(testMatch.link(share.gplus));

    assert.ok(share.whatsapp);
    assert.ok(testMatch.link(share.whatsapp));
    assert.ok(testMatch.title(share.whatsapp));

    assert.ok(share.email);
    assert.ok(testMatch.link(share.email));
    assert.ok(testMatch.title(share.whatsapp));

    assert.ok(share.wordpress);
    assert.ok(testMatch.link(share.wordpress));

    assert.ok(share.tumblr);
    assert.ok(testMatch.link(share.tumblr));

    assert.ok(share.pocket);
    assert.ok(testMatch.link(share.pocket));
  });
});
