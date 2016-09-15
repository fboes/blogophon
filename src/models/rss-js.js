'use strict';

/**
 * Returns RSS as a javascript object.
 * @constructor
 */
var RssJs = function(index, pubDate, config, title) {
  return {
    version: 2.0,
    channel: {
      title: config.name + (title ? ' | ' + title : ''),
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
          description: item.safeHtmlTeaser || item.htmlTeaser,
          contentEncoded: item.safeHtml || item.html,
          link: item.meta.AbsoluteUrl,
          pubDate: item.meta.Created.rfc,
          guid: item.meta.AbsoluteUrl,
          categories: tags
        };
      })
    }
  };
};

module.exports = RssJs;
