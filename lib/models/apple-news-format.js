'use strict';

const blogophonDateFormat = require('../helpers/blogophon-date-format');

/**
 * Returns RSS as a javascript object.
 * @see  https://developer.apple.com/library/content/documentation/General/Conceptual/Apple_News_Format_Ref/index.html
 * @constructor
 * @param  {Object} post [description]
 * @return {Object}      [description]
 */
const appleNewsFormat = function(post) {
  return {
    version: 1.2,
    identifier: post.meta.AbsoluteUrl,
    title: post.meta.Title,
    language: post.meta.Language.replace(/[-]/, '_'),
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
      thumbnailURL: post.meta.Image,
      datePublished: blogophonDateFormat(post.meta.Created, 'iso'),
      excerpt: post.meta.Description,
      keywords: post.meta.Keywords || []
    }
  };
};

module.exports = appleNewsFormat;
