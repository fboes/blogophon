'use strict';

/**
 * Returns RSS as a javascript object.
 * @constructor
 */
var jsonRss = function(index, pubDate, config, title) {
  return {
    version: 2.0,
    channel: {
      title: (config.name || '') + (title ? ' | ' + title : ''),
      link: config.baseUrl + config.basePath,
      description: config.description || '',
      language: config.language,
      lastBuildDate: pubDate,
      items: index.map(function(item){
        var tags = [];
        if (item.meta.Tags !== undefined) {
          tags = item.meta.Tags.map(function(t){
            return t.title;
          });
        }
        item.meta.LatLong = null;
        if (item.meta.Latitude || item.meta.Longitude) {
          item.meta.LatLong = item.meta.Latitude +' '+ item.meta.Longitude;
        }
        return {
          title: item.meta.Title,
          description: item.safeHtmlTeaser || item.htmlTeaser,
          contentEncoded: item.safeHtml || item.html,
          link: item.meta.AbsoluteUrl,
          pubDate: item.meta.Created.rfc,
          guid: item.meta.Id || item.meta.AbsoluteUrl,
          categories: tags,
          georssPoint: item.meta.LatLong
        };
      })
    }
  };
};

module.exports = jsonRss;
