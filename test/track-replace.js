'use strict';

const assert = require('assert');
const trackReplace = require('../lib/helpers/track-replace');

describe('Track Replace', function() {
  it('should replace an URL', function() {
    assert.equal(trackReplace('1%url2', 'xxx'), '1xxx2');
  });
  it('should replace an URL and a title', function() {
    assert.equal(trackReplace('1%url2%title3', 'xxx', 'yyy'), '1xxx2yyy3');
  });
  it('should quote URL and a title', function() {
    assert.equal(trackReplace('1%url2%title3', ' xxx ', ' yyy '), '1%20xxx%202%20yyy%203');
  });
  it('should note quote the original string', function() {
    assert.equal(trackReplace('?1=%url&2=%title&3', ' xxx ', ' yyy '), '?1=%20xxx%20&2=%20yyy%20&3');
  });
  it('should leave HTML alone', function() {
    assert.equal(trackReplace('<img src="https://stats.3960.org/piwik.php?idsite=8&amp;rec=1&amp;action_name=%title&amp;url=%url%3Futm_source%3Dnewsfeed" alt="" />', 1, 2), '<img src="https://stats.3960.org/piwik.php?idsite=8&amp;rec=1&amp;action_name=2&amp;url=1%3Futm_source%3Dnewsfeed" alt="" />');
  });
});
