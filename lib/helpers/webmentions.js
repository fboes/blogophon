'use strict';

/**
 * Send Webmentions for posts
 * @see    http://alistapart.com/article/webmentions-enabling-better-communication-on-the-internet
 * @return {Object} [description]
 */
const webmentions = function() {
  const external = {};
  const internal = {};

  /**
   * Send Webmentions to all external URLs found in article
   * @param  {Post}   post [description]
   * @return {Promise}      of external URLs informed
   */
  external.sendMentions = function(post) {
    const externalUrls = internal.findExternalUrls(post);
    return externalUrls.length;
  };

  /**
   * [findExternalUrls description]
   * @param  {Post}  post [description]
   * @return {Array}      [description]
   */
  internal.findExternalUrls = function(post) {
    if (post) {
      return [];
    }
    return [];
  };

  internal.sendMention = function() {};

  return external;
};

module.exports = webmentions;
