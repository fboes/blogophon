'use strict';

/**
 * Represents all posts
 * @constructor
 */
var RssJs = function (index, pubDate) {
  var config = require('./config');

  return {
    version: 2.0,
    channel: {
      title: config.name,
      link: config.baseUrl + config.basePath,
      description: config.description,
      language: config.language,
      lastBuildDate: pubDate,
      items: index.map(function(item){
        var tags = [];
        if (item.meta.Tags !== undefined) {
          tags = item.meta.Tags.map(function(t){
            return t.title;
          });
        }
        return {
          title: item.meta.Title,
          description: item.htmlTeaser,
          link: item.meta.AbsoluteUrl,
          pubDate: item.meta.rfcDate,
          guid: item.meta.AbsoluteUrl,
          categories: tags
        };
      })
    }
  };
};

module.exports = RssJs;
