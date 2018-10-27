'use strict';

// Blogophon internal
const trackReplace        = require('../helpers/track-replace');
const blogophonDateFormat = require('../helpers/blogophon-date-format');

/**
 * Returns RSS as a javascript object.
 * @see  https://jsonfeed.org/
 * @constructor
 * @param  {Array}  index   [description]
 * @param  {String} pubDate [description]
 * @param  {Object} config  [description]
 * @param  {String} title   [description]
 * @param  {String} feedUrl [description]
 * @return {Object}         [description]
 */
const jsonFeed = function(index, pubDate, config, title, feedUrl) {
  return {
    version: "https://jsonfeed.org/version/1",
    title: (config.name || '') + (title ? ' | ' + title : ''),
    home_page_url: config.baseUrl + config.basePath,
    feed_url: feedUrl || null,
    description: config.description || '',
    icon: config.themeConf.ogImage,
    favicon: config.themeConf.icon128 ? config.themeConf.icon128.src : null,
    author: {
      name: config.defaultAuthor.name,
      url: 'mailto:' + config.defaultAuthor.email
    },
    _rss: {
      about: "http://cyber.harvard.edu/rss/rss.html",
      copyright: config.copyright || undefined,
      language: config.locale.language
    },
    items: index.map(function(post){
      let returnPost = {
        id: post.meta.Id || post.meta.AbsoluteUrl,
        url: post.meta.AbsoluteUrl,
        title: post.meta.Title,
        content_html: post.safeHtml || post.html,
        summary: post.meta.Description || '',
        date_published: blogophonDateFormat(post.meta.Created, 'rfc3339'),
        date_modified: blogophonDateFormat(post.meta.Modified, 'rfc3339'),
        author: {
          name: post.meta.AuthorName,
          url: 'mailto:' + post.meta.AuthorEmail,
          avatar: post.meta.AuthorImage
        },
        banner_image: post.meta.Image,
        _rss: {
          about: "http://cyber.harvard.edu/rss/rss.html",
          language: post.meta.Language || config.locale.language
        }
      };

      if (config.htmlAnalyticsFeed) {
        returnPost.content_html += trackReplace(
          config.htmlAnalyticsFeed,
          post.meta.AbsoluteUrl,
          post.meta.Title
        );
      }

      if (post.meta.Image) {
        returnPost.image = post.meta.Image;
      }

      if (post.meta.AbsoluteLink && post.meta.AbsoluteLink !== post.meta.AbsoluteUrl) {
        returnPost.external_url = post.meta.AbsoluteLink;
      }

      if (post.meta.Tags) {
        returnPost.tags = post.meta.Tags.map(function(t){
          return t.title;
        });
      }

      if (post.meta.Enclosure) {
        returnPost.attachments = post.meta.Enclosure.map(function(t){
          return {
            url: t.url,
            mime_type: t.type,
            size_in_bytes: t.length
          };
        });
      }

      if (post.meta.Latitude || post.meta.Longitude) {
        returnPost._geo = {
          about: "http://geojson.org/",
          type: 'Point',
          coordinates: [post.meta.Longitude, post.meta.Latitude]
        };
      }

      return returnPost;
    })
  };
};

module.exports = jsonFeed;
