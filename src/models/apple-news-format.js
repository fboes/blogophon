'use strict';

/**
 * Returns RSS as a javascript object.
 * @constructor
 * @return {AppleNewsFormat}
 */
var AppleNewsFormat = function(post) {
  return this.init(post);
};

/**
 * Convert a post into Apple News JSON
 * @param {Post} post
 * @return {Object}
 */
AppleNewsFormat.prototype.init = function(post) {
  return {
    version: 1.2,
    identifier: post.meta.AbsoluteUrl,
    title: post.meta.Title,
    language: post.meta.Language.replace(/\-/,'_'),
    layout: {
      columns: 7,
      width: 1024
    },
    components: [
      {
        role: 'body',
        text: post.markdown
      }
    ],
    componentTextStyles: {
      default: {
        fontName: "Helvetica",
        fontSize: 13,
        linkStyle: {
          textColor: "#428bca"
        }
      }
    },
    metadata: {
      canonicalURL: post.meta.AbsoluteUrl,
      datePublished: post.meta.Created.iso,
      excerpt: post.meta.Description,
      keywords: post.meta.Keywords.trim().split(/,\s*/)
    }
  };
};

module.exports = AppleNewsFormat;
