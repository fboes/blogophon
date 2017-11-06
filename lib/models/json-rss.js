'use strict';

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
      atomLink: {
        href: feedUrl,
        rel: 'self',
        type: 'application/rss+json'
      },
      lastBuildDate: pubDate.rfc,
      lastBuildDateTs: pubDate.timestamp,
      items: index.map(function(item){
        let returnItem = {
          title: item.meta.Title,
          description: item.safeHtmlTeaser || item.htmlTeaser,
          contentEncoded: item.safeHtml || item.html,
          link: item.meta.AbsoluteLink || item.meta.AbsoluteUrl,
          pubDate: item.meta.Created.rfc,
          pubDateTs: item.meta.Created.timestamp,
          guid: item.meta.Id || item.meta.AbsoluteUrl,
          author: item.meta.AuthorEmail + ' (' + item.meta.AuthorName + ')'
        };

        if (item.meta.Tags) {
          returnItem.categories = item.meta.Tags.map(function(t){
            return t.title;
          });
        }

        if (item.meta.Latitude || item.meta.Longitude) {
          returnItem.georssPoint = item.meta.Latitude +' '+ item.meta.Longitude;
        }

        return returnItem;
      })
    }
  };
};

module.exports = jsonRss;
