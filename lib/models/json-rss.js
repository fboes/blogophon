'use strict';

const trackReplace        = require('../helpers/track-replace');
const blogophonDateFormat = require('../helpers/blogophon-date-format');

/**
 * Returns RSS as a javascript object.
 * @constructor
 * @param  {Array}  index   [description]
 * @param  {String} pubDate [description]
 * @param  {Object} config  [description]
 * @param  {String} title   [description]
 * @param  {String} feedUrl [description]
 * @return {Object}         [description]
 */
const jsonRss = function(index, pubDate, config, title, feedUrl) {
  return {
    version: "2.0",
    channel: {
      title: (config.name || '') + (title ? ' | ' + title : ''),
      link: config.baseUrl + config.basePath,
      description: config.description || '',
      language: config.locale.language,
      copyright: config.copyright || undefined,
      atomLink: {
        href: feedUrl,
        rel: 'self',
        type: 'application/rss+json'
      },
      lastBuildDate: blogophonDateFormat(pubDate, 'rfc'),
      lastBuildDateTs: blogophonDateFormat(pubDate, 'timestamp'),
      items: index.map(function(item){
        let returnItem = {
          title: item.meta.Title,
          description: item.safeHtmlTeaser || item.htmlTeaser,
          contentEncoded: item.safeHtml || item.html,
          link: item.meta.AbsoluteLink || item.meta.AbsoluteUrl,
          pubDate: blogophonDateFormat(item.meta.Created, 'rfc'),
          pubDateTs: blogophonDateFormat(item.meta.Created, 'timestamp'),
          guid: item.meta.Id || item.meta.AbsoluteUrl,
          author: item.meta.AuthorEmail + ' (' + item.meta.AuthorName + ')'
        };

        if (config.htmlAnalyticsFeed) {
          returnItem.contentEncoded += trackReplace(
            config.htmlAnalyticsFeed,
            item.meta.AbsoluteUrl,
            item.meta.Title
          );
        }

        if (item.meta.Keywords) {
          returnItem.categories = item.meta.Keywords;
        }

        if (item.meta.Latitude || item.meta.Longitude) {
          returnItem.georssPoint = item.meta.Latitude +' '+ item.meta.Longitude;
        }

        if (item.meta.Enclosure) {
          returnItem.enclosure = item.meta.Enclosure.map(function(t){
            return t;
          });
        }

        return returnItem;
      })
    }
  };
};

module.exports = jsonRss;
