'use strict';

/**
 * Represents all posts
 * @constructor
 */
var RssJs = function (index, pubDate) {
  var config = require('./config');
  var items  = [];

  index.forEach(function(item){
    var tags = [];
    if (item.meta.Tags !== undefined) {
      item.meta.Tags.forEach(function(t){
        tags.push(t.title);
      });
    }
    items.push({
      title: item.meta.Title,
      description: item.htmlTeaser,
      link: config.baseUrl + config.basePath + item.meta.Url,
      pubDate: item.meta.rfcDate,
      guid: config.baseUrl + config.basePath + item.meta.Url,
      categories: tags
    });
  });

  return {
    version: 2.0,
    channel: {
      title: config.name,
      link: config.baseUrl + config.basePath,
      description: config.description,
      language: config.language,
      lastBuildDate: pubDate,
      items: items
    }
  };
};

module.exports = RssJs;
